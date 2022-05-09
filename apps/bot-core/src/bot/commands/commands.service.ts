import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TELEGRAF_BOT_NAME } from 'src/bot/telegraf.constants';

import { Context, Markup, Telegraf } from 'telegraf';

export enum CommandsEnum {
  Search = 'search',
  Settings = 'settings',
  Joke = 'Joke',
  Feedback = 'feedback',
  Ads = 'ads',
}

@Injectable()
export class CommandsService implements OnModuleInit {
  private bot: Telegraf<any>;
  private arr: Array<null | { foo: string } | undefined> = [];
  private res = this.arr.filter((i) => i.foo);

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.startCommand = this.startCommand.bind(this);
  }

  listenCommands() {
    this.bot.start(this.startCommand);
    this.bot.action(CommandsEnum.Search, (ctx) => {
      ctx.reply(CommandsEnum.Search);
      ctx.answerCbQuery();
    });
    this.bot.action(CommandsEnum.Settings, (ctx) => {
      ctx.reply(CommandsEnum.Settings);
      ctx.answerCbQuery();
    });
    this.bot.action(CommandsEnum.Joke, (ctx) => {
      ctx.answerCbQuery();
    });
    this.bot.action(CommandsEnum.Feedback, (ctx) => {
      ctx.reply(CommandsEnum.Feedback);
      ctx.answerCbQuery();
    });
    this.bot.action(CommandsEnum.Ads, (ctx) => {
      ctx.reply(CommandsEnum.Ads);
      ctx.answerCbQuery();
    });

    this.bot.hears('🔍 Menu', this.menuHandler);
  }

  async startCommand(ctx: Context) {
    ctx.reply(
      'Welcome!',
      Markup.keyboard([[Markup.button.text('🔍 Menu')]]).resize(),
    );
  }

  menuHandler(ctx: Context): void {
    ctx.reply(
      'This is START command',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🔍 Search', CommandsEnum.Search),
          Markup.button.callback('☸ Setting', CommandsEnum.Settings),
        ],
        [
          Markup.button.callback('🤩 Joke', CommandsEnum.Joke),
          Markup.button.callback('🥶Feedback', CommandsEnum.Feedback),
          Markup.button.callback('🧠Adds', CommandsEnum.Ads),
        ],
        [Markup.button.webApp('WebApp', 'https://youtube.com')],
      ]),
    );
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.bot.telegram.setMyCommands([
      { command: '/help', description: 'Help' },
      { command: '/custom', description: 'Custom command' },
    ]),
      this.listenCommands();
  }
}
