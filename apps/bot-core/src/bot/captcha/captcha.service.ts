import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { Context, Markup, Telegraf } from 'telegraf';
import { getRandomInt } from '../core/utils/number.utils';
import { Logger } from '@nestjs/common';
import { CaptchaServiceClient } from '@app/protobufs';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { captchaServiceOptions } from '../options/grpc.options';
import {
  createCbData,
  getActionPrefix,
  parseCbData,
} from '../utils/actions.utils';
import { getUserMention } from '../utils/user.utils';

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
  chatId: number;
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
  private bot: Telegraf<any>;
  @Client(captchaServiceOptions)
  private client: ClientGrpc;

  private captchaService: CaptchaServiceClient;
  private waitCaptcha: Map<number, ICaptchaPayload[]> = new Map();

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.sendCaptcha = this.sendCaptcha.bind(this);
    this.enterMessage = this.enterMessage.bind(this);
    this.validateCaptcha = this.validateCaptcha.bind(this);
  }

  listenEvents() {
    this.bot.command('captcha', this.enterMessage);
    this.bot.hears(/^(\-{0,1})[0-9]+$/, this.validateCaptcha);
    this.bot.on('new_chat_members', this.enterMessage);
    this.bot.action(getActionPrefix(ACTION_PREFIX), this.validateCaptcha);
  }

  async validateCaptcha(ctx: Context) {
    const chatId = ctx.chat.id;

    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      const channelWaitCaptcha = this.waitCaptcha.get(chatId);
      const userCaptcha = channelWaitCaptcha?.find(
        (captcha) => captcha.userId === userId,
      );
      let isTriggeredAdmin = false;
      try {
        isTriggeredAdmin = Boolean(
          (await this.bot.telegram.getChatAdministrators(chatId)).find(
            (a) => a.user.id === userId,
          ),
        );
      } catch (e) {
        isTriggeredAdmin = false;
      }

      try {
        const userChoice = parseCbData<ICallbackData>(
          ACTION_PREFIX,
          ctx.callbackQuery.data,
        );

        if (
          isTriggeredAdmin ||
          (userCaptcha.triesLeft > 0 &&
            userChoice.answer === userCaptcha.answer)
        ) {
          userCaptcha.enterMessageIds.forEach((msg) => {
            this.bot.telegram.deleteMessage(ctx.chat.id, msg);
          });
          this.waitCaptcha.delete(userId);
          clearTimeout(userCaptcha.banTimer);
        } else {
          const triesLeft = userCaptcha.triesLeft - 1;
          if (triesLeft === 0) {
            this.waitCaptcha.delete(userId);
            try {
              userCaptcha.enterMessageIds.forEach((msg) => {
                ctx.deleteMessage(msg);
              });
              clearTimeout(userCaptcha.banTimer);
              await this.banUser(userId, userCaptcha.chatId);
            } catch (err) {
              Logger.error(err.message);
            }
            ctx.answerCbQuery();
            return;
          } else {
            const errorText = `${
              ERROR_MESSAGES[getRandomInt(0, ERROR_MESSAGES.length - 1)]
            } Осталось попыток: ${triesLeft}`;
            this.sendCaptcha(ctx, triesLeft, errorText);
          }
        }
      } catch (e) {
        Logger.error(e, 'validate error');
      }
      ctx.answerCbQuery();
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
    this.sendCaptcha(ctx);
  }

  async sendCaptcha(
    ctx: Context,
    triesLeft = CAPTCHA_TRIES,
    imageText?: string,
  ) {
    const captcha = await firstValueFrom(this.captchaService.getCaptcha({}));
    const userId = ctx.from.id || ctx.callbackQuery.from.id;
    const chatId = ctx.chat.id || ctx.chat.id;
    const defaultText = `Велкам, ${getUserMention(
      ctx.from || ctx.callbackQuery.from,
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
                .filter((a, b) => Number(a) - Number(b))
                .map((i) =>
                  Markup.button.callback(
                    i,
                    createCbData(ACTION_PREFIX, {
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
        const userCaptcha = channelCaptcha?.find((i) => i.chatId === userId);
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
          const banTimer = setTimeout(() => {
            this.banUser(userId, chatId);
          }, SECONDS_BEFORE_BAN * 1000);

          this.waitCaptcha.set(chatId, [
            {
              userId,
              answer: captcha.answer,
              triesLeft,
              banTimer,
              chatId,
              enterMessageIds: [msg.message_id],
            },
          ]);
        }
      });
  }

  onModuleInit(): void {
    this.captchaService =
      this.client.getService<CaptchaServiceClient>('CaptchaService');

    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });

    this.listenEvents();
  }
}
