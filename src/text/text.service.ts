import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TELEGRAF_BOT_NAME } from 'src/bot/telegraf.constants';

import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TextService implements OnModuleInit {
  private bot: Telegraf<any>;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.listenCommands();
  }

  listenCommands() {
    this.bot.hears('someText', this.someTextHandler);
  }

  someTextHandler(ctx: Context): void {
    ctx.reply('I heard some text');
  }
}
