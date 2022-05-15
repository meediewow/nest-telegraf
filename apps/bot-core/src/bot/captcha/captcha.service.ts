import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { Context, Markup, Telegraf } from 'telegraf';
import { Logger } from '@nestjs/common';
import { CaptchaServiceClient } from '@app/protobufs';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { captchaServiceOptions } from '../options/grpc.options';
import { getUserMention } from '../utils/user.utils';
import { getRandomInt } from '../utils/number.utils';
import { ActionStore } from '../utils/actions-store.utils';

interface ICaptchaPayload {
  answer: string;
  triesLeft: number;
  userId: number;
  chatId: number;
  banTimer: NodeJS.Timeout;
  enterMessageIds: number[];
}

interface ICallbackData {
  answer: string;
  userId: number;
}

const CAPTCHA_TRIES = 3;

const ERROR_MESSAGES = [
  'А ты точно не робот?',
  'Неее, дружище, что-то не так.',
  'Пересчитай, пожалуйста.',
];

const SECONDS_BEFORE_BAN = 270;
const BAN_MINUTES = 30;
const ACTION_PREFIX = 'captcha';

@Injectable()
export class EventsService implements OnModuleInit {
  private bot!: Telegraf;
  @Client(captchaServiceOptions)
  private client!: ClientGrpc;

  private readonly logger = new Logger(EventsService.name);

  private captchaService!: CaptchaServiceClient;
  private waitCaptcha: Map<number, ICaptchaPayload[]> = new Map();
  private actionsStore: ActionStore;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.sendCaptcha = this.sendCaptcha.bind(this);
    this.enterMessage = this.enterMessage.bind(this);
    this.validateCaptcha = this.validateCaptcha.bind(this);
    this.actionsStore = new ActionStore(ACTION_PREFIX);
  }

  listenEvents() {
    // this.bot.command('captcha', this.enterMessage);
    this.bot.hears(/^(\-{0,1})[0-9]+$/, this.validateCaptcha);
    this.bot.on('new_chat_members', this.enterMessage);
    this.bot.action(
      this.actionsStore.getActionPrefixRegExp(),
      this.validateCaptcha,
    );
  }

  async validateCaptcha(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    if (ctx.callbackQuery) {
      const triggerUserId = ctx.callbackQuery.from.id;
      const userChoice = this.actionsStore.get<ICallbackData>(
        ctx.callbackQuery.data as string,
      );
      const userId = Number(userChoice.userId);
      const channelWaitCaptcha = this.waitCaptcha.get(chatId) || [];
      const userCaptcha = channelWaitCaptcha?.find(
        (captcha) => captcha.userId === userId,
      );
      let isTriggeredAdmin = false;
      try {
        isTriggeredAdmin = Boolean(
          (await this.bot.telegram.getChatAdministrators(chatId)).find(
            (a) => a.user.id === triggerUserId,
          ),
        );
      } catch (e) {
        isTriggeredAdmin = false;
      }

      if (userId !== triggerUserId && !isTriggeredAdmin) {
        ctx.answerCbQuery('Капча предоставлена для другого пользователя', {
          show_alert: true,
        });
        return;
      }

      try {
        if (
          (isTriggeredAdmin && userCaptcha) ||
          (userCaptcha &&
            userCaptcha?.triesLeft > 0 &&
            userChoice.answer === userCaptcha?.answer)
        ) {
          userCaptcha?.enterMessageIds.forEach((msg) => {
            this.bot.telegram.deleteMessage(chatId, msg);
          });
          this.waitCaptcha.set(
            chatId,
            channelWaitCaptcha.filter((i) => i.chatId !== chatId),
          );
          clearTimeout(userCaptcha.banTimer);
          this.bot.telegram.restrictChatMember(chatId, userId, {
            permissions: {
              can_send_messages: true,
            },
          });
          ctx.answerCbQuery('Добро пожаловать', {
            show_alert: true,
          });
          return;
        } else {
          if (userCaptcha) {
            const triesLeft = userCaptcha.triesLeft - 1;
            if (triesLeft === 0) {
              this.waitCaptcha.set(
                chatId,
                channelWaitCaptcha.filter((i) => i.chatId !== chatId),
              );
              this.waitCaptcha.delete(userId);
              try {
                userCaptcha.enterMessageIds.forEach((msg) => {
                  ctx.deleteMessage(msg);
                });
                clearTimeout(userCaptcha.banTimer);
                await ctx.answerCbQuery(
                  `Ты не прошел капчу, время бана: ${BAN_MINUTES} минут`,
                  {
                    show_alert: true,
                  },
                );
                await this.banUser(userId, userCaptcha.chatId);
              } catch (err: any) {
                Logger.error(err.message);
                ctx.answerCbQuery();
              }
              return;
            } else {
              const errorText = `${
                ERROR_MESSAGES[getRandomInt(0, ERROR_MESSAGES.length - 1)]
              } Осталось попыток: ${triesLeft}`;
              this.sendCaptcha(ctx, triesLeft, userId, errorText);
            }
          }
        }
      } catch (e) {
        Logger.error(e, 'validate error');
      }
    }
  }

  private async banUser(userId: number, chatId: number) {
    try {
      return this.bot.telegram.banChatMember(
        chatId,
        userId,
        moment().add(BAN_MINUTES, 'minutes').unix(),
      );
    } catch (e) {
      Logger.error(e);
    }
  }

  enterMessage(ctx: Context) {
    this.sendCaptcha(ctx, undefined);
  }

  async sendCaptcha(
    ctx: Context,
    triesLeft = CAPTCHA_TRIES,
    userId = ctx.from?.id,
    imageText?: string,
  ) {
    const captcha = await firstValueFrom(this.captchaService.getCaptcha({}));
    const chatId = ctx.chat?.id;
    if (!chatId || !userId) {
      return;
    }
    const defaultText = `Велкам, ${getUserMention(
      ctx.from || ctx.callbackQuery?.from,
    )}! Пройди капчу, иначе мы забаним, потому что можем 😁`;
    ctx
      .replyWithPhoto(
        {
          source: Buffer.from(
            captcha.image.replace('data:image/png;base64,', ''),
            'base64',
          ),
        },
        {
          caption: imageText || defaultText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                captcha.answer,
                ...new Array(2)
                  .fill(null)
                  .map(() => String(getRandomInt(-100, 100))),
              ]
                .sort((a, b) => Number(a) - Number(b))
                .map((i) =>
                  Markup.button.callback(
                    i,
                    this.actionsStore.add({
                      answer: i,
                      userId,
                    }),
                  ),
                ),
            ],
          },
        },
      )
      .then((msg) => {
        const channelCaptcha = this.waitCaptcha.get(chatId) || [];
        const userCaptcha = channelCaptcha?.find((i) => i.userId === userId);
        if (userCaptcha) {
          this.waitCaptcha.set(chatId, [
            ...channelCaptcha.filter((i) => i.chatId !== chatId),
            {
              ...userCaptcha,
              answer: captcha.answer,
              triesLeft,
              enterMessageIds: [...userCaptcha.enterMessageIds, msg.message_id],
            },
          ]);
        } else {
          try {
            this.bot.telegram.restrictChatMember(chatId, userId, {
              permissions: {
                can_send_messages: false,
              },
            });
          } catch (error) {
            this.logger.error(error);
          }

          const banTimer = setTimeout(() => {
            this.banUser(userId, chatId);
          }, SECONDS_BEFORE_BAN * 1000);
          this.waitCaptcha.set(chatId, [
            ...channelCaptcha,
            {
              userId,
              answer: captcha.answer,
              triesLeft,
              banTimer,
              chatId,
              enterMessageIds: [
                ctx.message?.message_id as number,
                msg.message_id,
              ],
            },
          ]);
        }
      });
  }

  onModuleInit(): void {
    this.captchaService =
      this.client.getService<CaptchaServiceClient>('CaptchaService');

    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });

    this.listenEvents();
  }
}
