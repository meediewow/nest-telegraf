import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Context, Markup, Telegraf } from 'telegraf';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';

@Injectable()
export class MenuService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.sendMenu = this.sendMenu.bind(this);
  }

  listenCommands() {
    this.bot.command('menu', this.sendMenu);
  }

  sendMenu(ctx: Context): void {
    ctx.reply(
      'Доступные функции: ',
      Markup.keyboard([
        [Markup.button.text('/hunt'), Markup.button.text('/hunt_scores')],
        [Markup.button.text('/fish'), Markup.button.text('/fish_scores')],
        [Markup.button.text('/dig'), Markup.button.text('/dig_scores')],
        [Markup.button.text('/total_scores')],
      ]).resize(),
    );
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.listenCommands();
  }
}
