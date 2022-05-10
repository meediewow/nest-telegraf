import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TELEGRAF_BOT_NAME } from 'src/bot/telegraf.constants';
import * as moment from 'moment';
import { Context, Markup, Telegraf } from 'telegraf';
import { captchaServiceOptions } from '../options/grpc.options';
import { getRandomInt } from '../utils/number.utils';
import { Logger } from '@nestjs/common';
import { CaptchaServiceClient } from '@app/protobufs';

interface IWaitCaptchaPayload {
  answer: string;
  triesLeft: number;
}

const CAPTCHA_TRIES = 3;

const ERROR_MESSAGES = [
  'А ты точно не робот?',
  'Неее, дружище, что-то не так.',
  'Пересчитай, пожалуйста.',
];

@Injectable()
export class EventsService implements OnModuleInit {
  private bot: Telegraf<any>;
  @Client(captchaServiceOptions)
  private client: ClientGrpc;

  private captchaService: CaptchaServiceClient;
  private waitCaptcha: Map<number, IWaitCaptchaPayload> = new Map();

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.sendCaptcha = this.sendCaptcha.bind(this);
    this.enterMessage = this.enterMessage.bind(this);
    this.validateCaptcha = this.validateCaptcha.bind(this);
    this.getFact = this.getFact.bind(this);
  }

  listenEvents() {
    this.bot.command('captcha', this.enterMessage);
    this.bot.command('fact', this.getFact);
    this.bot.hears(/^(\-{0,1})[0-9]+$/, this.validateCaptcha);
    this.bot.on('new_chat_members', this.enterMessage);
    this.bot.action(/.+/, this.validateCaptcha);
  }

  async getFact(ctx: Context) {
    const data = await firstValueFrom(this.captchaService.getData({}));
    ctx.reply('Fact: ' + data.fact);
    ctx.reply('Lenght: ' + data.length);
  }

  async validateCaptcha(ctx: Context<any>) {
    const userId = ctx.from.id;
    const result = this.waitCaptcha.get(userId);
    const userChoice = ctx.callbackQuery.data;
    if (result) {
      if (result.triesLeft > 0 && userChoice === result.answer) {
        this.waitCaptcha.delete(userId);
        ctx.reply('Капча пройдена!');
      } else {
        const triesLeft = result.triesLeft - 1;
        if (triesLeft === 0) {
          this.waitCaptcha.delete(userId);
          ctx.reply('Тоби пизда');
          try {
            await ctx.banChatMember(userId, moment().add(30, 'minutes').unix());
          } catch (err) {
            Logger.error(err.message);
          }
          ctx.answerCbQuery();
          return;
        } else {
          ctx.reply(
            `${
              ERROR_MESSAGES[getRandomInt(0, ERROR_MESSAGES.length - 1)]
            } Осталось попыток: ${triesLeft}`,
          );
          this.sendCaptcha(ctx, triesLeft);
        }
      }
    }
    ctx.answerCbQuery();
  }

  enterMessage(ctx: Context) {
    ctx.reply('Велкам! Пройди капчу, иначе мы забаним, потому что можем 😁');
    this.sendCaptcha(ctx);
  }

  async sendCaptcha(ctx: Context, triesCount = CAPTCHA_TRIES) {
    const captcha = await firstValueFrom(this.captchaService.getCaptcha({}));
    this.waitCaptcha.set(ctx.from.id, {
      answer: captcha.answer,
      triesLeft: triesCount,
    });
    ctx.replyWithPhoto(
      {
        source: Buffer.from(
          captcha.image.replace('data:image/png;base64,', ''),
          'base64',
        ),
      },
      Markup.inlineKeyboard([
        [
          captcha.answer,
          ...new Array(2).fill(null).map(() => String(getRandomInt(-100, 100))),
        ]
          .filter((a, b) => Number(a) - Number(b))
          .map((i) => Markup.button.callback(i, i)),
      ]),
    );
  }

  onModuleInit(): void {
    this.captchaService =
      this.client.getService<CaptchaServiceClient>('CaptchaService');

    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.bot.telegram.setMyCommands([
      { command: '/captcha', description: 'Custom command' },
    ]),
      this.listenEvents();
  }
}
