import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client } from '@nestjs/microservices';
import { Context, Markup, Telegraf } from 'telegraf';
import { Logger } from '@nestjs/common';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { captchaServiceOptions } from '../options/grpc.options';
import { IDelayBuffer, KarmaActionsEnum } from './karma.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Karma } from 'src/mongodb/entity/karma.entity';
import { MongoRepository } from 'typeorm';
import { Chat } from 'src/mongodb/entity/chat.entity';
import { User, Message } from 'telegraf/typings/core/types/typegram';
import { getUserMention } from '../utils/user.util';
import moment from 'moment';
import { generateId } from '../utils/number.util';
import {
  DELAY,
  HEARS_REGEXP,
  INIT_KARMA,
  IS_RESTRICTIONS_ENABLED,
  LOWER_LEVEL,
  RESTRICTION_DAYS,
  TIME_TO_DELETE,
  TOP_LENGTH,
} from './karma.constants';
import { removeMessageTimeout } from '../utils/message.util';

@Injectable()
export class KarmaService implements OnModuleInit {
  private bot!: Telegraf;
  @Client(captchaServiceOptions)
  private readonly logger = new Logger(KarmaService.name);
  private delayBuffer: Map<number, IDelayBuffer[]> = new Map<
    number,
    IDelayBuffer[]
  >();

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
    @InjectRepository(Karma)
    private readonly karmaRepository: MongoRepository<Karma>,
    @InjectRepository(Chat)
    private readonly chatRepository: MongoRepository<Chat>,
  ) {
    this.menu = this.menu.bind(this);
    this.enable = this.enable.bind(this);
    this.myKarma = this.myKarma.bind(this);
    this.topKarma = this.topKarma.bind(this);
    this.change = this.change.bind(this);
    this.disable = this.disable.bind(this);
  }

  private async getUserKarma(
    user: User | undefined,
    chatId: number | undefined,
  ): Promise<number> {
    const userId = user?.id;
    const userKarma = await this.karmaRepository.findOne({
      where: {
        chatId,
        userId,
      },
    });
    if (!userKarma) {
      return (await this.initUserKarma(chatId, user))?.value;
    }
    return userKarma.value;
  }

  private async changeKarma(
    chatId: number | undefined,
    user: User | undefined,
    value: number,
  ) {
    const userKarma = await this.karmaRepository.findOne({
      where: {
        chatId,
        userId: user?.id,
      },
    });

    if (userKarma) {
      this.karmaRepository.updateOne(
        {
          _id: userKarma.id,
        },
        {
          $set: {
            value,
          },
        },
      );
    }
  }

  private async initUserKarma(
    chatId: number | undefined,
    user: User | undefined,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { chatId },
    });
    return this.karmaRepository.save({
      chatId,
      userId: user?.id,
      telegrafData: user,
      value: chat?.karma.initKarma,
      restrictions: [],
    });
  }

  private async checkAdmin(
    userId: number | undefined,
    chatId: number | undefined,
  ) {
    let isAdmin = false;
    if (!chatId) {
      return isAdmin;
    }
    try {
      isAdmin = Boolean(
        (await this.bot.telegram.getChatAdministrators(chatId)).find(
          (a) => a.user.id === userId,
        ),
      );
    } catch (e) {
      isAdmin = false;
    }
    return isAdmin;
  }

  private async isEnabled(chatId: number | undefined) {
    return (
      await this.chatRepository.findOne({
        where: { chatId },
      })
    )?.karma?.isEnabled;
  }

  async enable(ctx: Context) {
    const update = ctx.callbackQuery;
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    const isAdmin = await this.checkAdmin(ctx.callbackQuery?.from.id, chatId);
    if (isAdmin && update) {
      const chat = await this.chatRepository.findOne({
        where: { chatId },
      });
      if (!chat) {
        await this.chatRepository.save({
          chatId,
          karma: {
            isEnabled: true,
            initKarma: INIT_KARMA,
            isRestrictionsEnabled: IS_RESTRICTIONS_ENABLED,
          },
        });
      } else if (!chat.karma) {
        await this.chatRepository.updateOne(
          {
            chatId,
          },
          {
            $set: {
              karma: {
                isEnabled: true,
                initKarma: INIT_KARMA,
                isRestrictionsEnabled: IS_RESTRICTIONS_ENABLED,
              },
            },
          },
        );
      } else if (!chat.karma.isEnabled) {
        await this.chatRepository.updateOne(
          {
            chatId,
          },
          {
            $set: {
              'karma.isEnabled': true,
            },
          },
        );
      } else {
        ctx.answerCbQuery('?????? ????????????????????????!', { show_alert: true });
      }
      ctx.answerCbQuery('?????????????? ????????????????????????!', { show_alert: true });
    } else {
      ctx.answerCbQuery('?????????? ???????????????? ?????????????? ????????????', { show_alert: true });
    }
  }

  async disable(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    const isAdmin = await this.checkAdmin(ctx.callbackQuery?.from.id, chatId);
    if (isAdmin) {
      const chat = await this.chatRepository.findOne({
        where: { chatId },
      });
      if (chat?.karma?.isEnabled) {
        this.chatRepository.updateOne(
          {
            _id: chat.id,
          },
          {
            $set: {
              'karma.isEnabled': false,
            },
          },
        );
        ctx.answerCbQuery('?????????????? ????????????????????????????!', { show_alert: true });
      }
    } else {
      ctx.answerCbQuery('?????????? ???????????????? ?????????????? ????????????', { show_alert: true });
    }
  }

  async topKarma(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    const isEnabled = await this.isEnabled(chatId);
    if (!isEnabled) {
      ctx.answerCbQuery('?????????? ???? ???????????????????????? ???? ????????????', {
        show_alert: true,
      });
      return;
    }

    const top = await this.karmaRepository.find({
      where: { chatId },
      order: { value: 'DESC' },
      take: TOP_LENGTH,
    });

    const resultText = top.reduce((acc, item) => {
      return `${acc}?????????? ???????????????????????? ${getUserMention(item?.telegrafData)}: ${
        item.value
      } \n`;
    }, '');

    ctx.reply(resultText, { parse_mode: 'Markdown' });
    ctx.answerCbQuery();
  }

  async menu(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    const isAdmin = await this.checkAdmin(ctx.from?.id, chatId);
    const isEnabled = await this.isEnabled(chatId);
    const common = [
      Markup.button.callback('??????', KarmaActionsEnum.TOP),
      Markup.button.callback('??????', KarmaActionsEnum.MY),
    ];
    const admin = [
      isEnabled
        ? Markup.button.callback('????????????????????????????', KarmaActionsEnum.OFF)
        : Markup.button.callback('????????????????????????', KarmaActionsEnum.ON),
    ];
    ctx.reply(
      '??????????',
      Markup.inlineKeyboard(isAdmin ? [...admin, ...common] : common),
    );
  }

  async change(ctx: Context) {
    const message = ctx.message as Message.TextMessage;
    const chatId = ctx.chat?.id;
    const targetUser = message.reply_to_message?.from;
    const triggerUser = ctx.from;
    const isEnabled = await this.isEnabled(chatId);

    if (!targetUser || !triggerUser || !chatId || !isEnabled) {
      return;
    }

    const userDelays = this.delayBuffer.get(triggerUser.id) || [];
    const hasTargetDelay = Boolean(
      userDelays.find((i) => i.targetId === targetUser.id),
    );

    const userKarma = await this.karmaRepository.findOne({
      where: {
        userId: targetUser.id,
        chatId,
      },
    });

    const hasActiveRestriction =
      userKarma?.lastRestrictionUntil &&
      userKarma.lastRestrictionUntil >= moment().unix();

    if (hasTargetDelay || hasActiveRestriction) {
      return;
    }

    if (
      message.reply_to_message &&
      message.from?.id !== targetUser?.id &&
      targetUser?.id !== this.bot.botInfo?.id
    ) {
      const chat = await this.chatRepository.findOne({ where: { chatId } });
      const triggerUserKarma = await this.getUserKarma(message.from, chatId);
      const targetUserKarma = await this.getUserKarma(targetUser, chatId);

      switch (message.text.trim()[0]) {
        case '+': {
          const updatedKarma = Number(
            (targetUserKarma + Math.sqrt(triggerUserKarma)).toFixed(2),
          );
          this.changeKarma(
            chatId,
            targetUser,
            Number((targetUserKarma + Math.sqrt(triggerUserKarma)).toFixed(2)),
          );
          ctx
            .reply(
              `???? ?????????????????? ?????????? ${getUserMention(
                targetUser,
              )} ???? ${updatedKarma} (+${Number(
                (updatedKarma - targetUserKarma).toFixed(2),
              )})`,
              { parse_mode: 'Markdown' },
            )
            .then((msg) => removeMessageTimeout(ctx, msg, TIME_TO_DELETE));
          break;
        }
        case '-': {
          const updatedKarma = Number(
            (targetUserKarma - Math.sqrt(triggerUserKarma)).toFixed(2),
          );
          ctx
            .reply(
              `???? ?????????????????? ?????????? ${getUserMention(
                targetUser,
              )} ???? ${updatedKarma} (-${Number(
                (targetUserKarma - updatedKarma).toFixed(2),
              )})`,
              { parse_mode: 'Markdown' },
            )
            .then((msg) => removeMessageTimeout(ctx, msg, TIME_TO_DELETE));
          if (updatedKarma <= LOWER_LEVEL) {
            if (chat?.karma.isRestrictionsEnabled) {
              const restrictionDays =
                (userKarma?.restrictions.sort(
                  (a, b) => b.periodDays - a.periodDays,
                )[0].periodDays || 0) + RESTRICTION_DAYS;
              ctx
                .reply(
                  `${getUserMention(
                    targetUser,
                  )}, ???????? ?????????? ?????????? ???????? ${LOWER_LEVEL}. ?????????????????????? ???????????????? ?????????????????? ???????????????????? ???? ${restrictionDays} ????????.`,
                  { parse_mode: 'Markdown' },
                )
                .then((msg) => removeMessageTimeout(ctx, msg));
              const untilData = moment().add(restrictionDays, 'days').unix();
              this.bot.telegram.restrictChatMember(chatId, targetUser?.id, {
                permissions: {
                  can_send_messages: false,
                },
                until_date: untilData,
              });
              this.karmaRepository.findOneAndUpdate(
                {
                  userId: targetUser.id,
                  chatId,
                },
                {
                  $set: {
                    lastRestrictionUntil: untilData,
                  },
                  $push: {
                    restrictions: {
                      createdAt: moment().unix(),
                      periodDays: restrictionDays,
                    },
                  },
                },
              );
            } else {
              ctx.reply(
                `${getUserMention(
                  targetUser,
                )}, ???????? ?????????? ?????????? ???????? ${LOWER_LEVEL}.`,
                {
                  parse_mode: 'Markdown',
                },
              );
            }
            this.changeKarma(chatId, targetUser, 20);
            break;
          }
          this.changeKarma(chatId, targetUser, updatedKarma);
          break;
        }
      }
      const timerId = generateId();
      const userDelays = this.delayBuffer.get(triggerUser.id) || [];
      this.delayBuffer.set(triggerUser.id, [
        ...userDelays,
        {
          id: timerId,
          targetId: targetUser.id,
          timer: setTimeout(() => {
            const userDelays = this.delayBuffer.get(triggerUser.id) || [];
            this.delayBuffer.set(
              triggerUser.id,
              userDelays.filter((i) => i.id !== timerId),
            );
          }, DELAY * 1000),
        },
      ]);
    }
  }

  async myKarma(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }
    const isEnabled = await this.isEnabled(chatId);
    if (!isEnabled) {
      ctx.answerCbQuery('?????????? ???? ???????????????????????? ???? ????????????', {
        show_alert: true,
      });
      return;
    }
    const userKarma = await this.getUserKarma(ctx.callbackQuery?.from, chatId);
    ctx.answerCbQuery(`???????? ?????????? ????????????????????: ${userKarma}`, {
      show_alert: true,
    });
  }

  listenEvents() {
    this.bot.command('karma', this.menu);
    this.bot.action(KarmaActionsEnum.ON, this.enable);
    this.bot.action(KarmaActionsEnum.MY, this.myKarma);
    this.bot.action(KarmaActionsEnum.TOP, this.topKarma);
    this.bot.action(KarmaActionsEnum.OFF, this.disable);
    this.bot.hears(HEARS_REGEXP, this.change);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });

    this.listenEvents();
  }
}
