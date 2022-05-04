import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TELEGRAF_BOT_NAME } from 'src/bot/telegraf.constants';

import { Context, Telegraf } from 'telegraf';

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
    this.bot.command('custom', this.customCommand);
  }

  startCommand(ctx: Context): void {
    ctx.reply('This is START command');
  }

  customCommand(ctx: Context): void {
    ctx.reply(`This is custom command: ${(ctx.message as any)?.text}`);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.listenCommands();
  }
}
