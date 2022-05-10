import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Telegraf } from 'telegraf';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';

@Injectable()
export class CommandsService implements OnModuleInit {
  private bot: Telegraf<any>;
  private arr: Array<null | { foo: string } | undefined> = [];
  private res = this.arr.filter((i) => i.foo);

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.bot.telegram.setMyCommands([
      { command: '/menu', description: 'Открыть меню' },
    ]);
  }
}
