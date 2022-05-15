import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Telegraf } from 'telegraf';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';

@Injectable()
export class CommandsService implements OnModuleInit {
  private bot!: Telegraf;
  private arr: Array<null | { foo: string } | undefined> = [];

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.bot.telegram.setMyCommands([
      { command: '/menu', description: 'Открыть меню' },
      { command: '/hunt', description: 'Игра "Охота" 🔫' },
      { command: '/dig', description: 'Игра "Археолог" ⚒' },
      { command: '/fish', description: 'Игра "Рыбалка" 🎣' },
      { command: '/hunt_scores', description: 'Результаты охоты' },
      { command: '/fish_scores', description: 'Результаты рыбалки' },
      { command: '/dig_scores', description: 'Результаты археологии' },
      { command: '/total_scores', description: 'Топ по всем играм' },
      { command: '/karma', description: 'Управление кармой' },
    ]);
  }
}
