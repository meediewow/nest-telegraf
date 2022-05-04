import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TELEGRAF_BOT_NAME } from 'src/bot/telegraf.constants';

import { Context, Markup, Telegraf } from 'telegraf';

export enum CommandsEnum {
  Search = 'search',
  Settings = 'settings',
  Popular = 'popular',
  Feedback = 'feedback',
  Ads = 'ads',
}

@Injectable()
export class CommandsService implements OnModuleInit {
  private bot: Telegraf<any>;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

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
    this.bot.action(CommandsEnum.Popular, (ctx) => {
      ctx.reply(CommandsEnum.Popular);
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

  startCommand(ctx: Context): void {
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
          Markup.button.callback('🤩 Popular', CommandsEnum.Popular),
          Markup.button.callback('🥶Feedback', CommandsEnum.Feedback),
          Markup.button.callback('🧠Adds', CommandsEnum.Ads),
        ],
      ]),
    );
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.listenCommands();
  }
}
