import { Inject, OnModuleInit } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { GamesEngineService } from './engine/games-engine.service';
import { Games } from './types/games.enums';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { ModuleRef } from '@nestjs/core';
import { getUserMention } from '../utils/user.util';
import { removeMessageTimeout } from '../utils/message.util';

const MAX_WEIGHT = 600;

const PLACES = [
  'тундре',
  'саване',
  'кустарнике',
  'полумраке бара',
  'слепой охоте',
  'норе',
  'кроне дерева',
  'потайном месте',
  'поле',
  'зарослях конопли',
  'переходе метро',
  'опасной близости от перекрестка',
  'местной алее',
];

const ITEMS = [
  'снорка',
  'черепаху',
  'летающую свинью',
  'носорога',
  'утенка',
  'волка',
  'медвед¤',
  'онаниста',
  'суслика',
  'кролика',
  'охотника',
  'оленя',
  'лису',
  'мышку',
  'лесника',
  'огромного медведя',
  'корову',
  'енота',
  'мишку коалу',
  'туриста',
];

export class HuntService implements OnModuleInit {
  private bot!: Telegraf;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
    private gamesEngineService: GamesEngineService,
  ) {
    this.play = this.play.bind(this);
    this.scores = this.scores.bind(this);
  }

  async play(ctx: Context) {
    this.gamesEngineService.play({
      chatId: ctx.chat?.id as number,
      cooldownText: 'Снаряжаем патроны...',
      getFirstMessage: (place: string) =>
        `Вы затаились в ${place} и поджидаете... Вы что-то слышите и стреляете в том направлении...`,
      getSecondMessage: (item: string, username: string, weight: number) =>
        `Поздравляю, ${username}!  Вы только что положили в свой мешок ${item} весом в ${weight} кило!`,
      getFailText: (place: string, username: string) =>
        `Крысы... вы промахнулись, ${username}. Может потом повезет?`,
      getLoseText: (username: string) =>
        `Извини, ${username}, но это не самая тяжелая находка!`,
      getWinText: (username: string) =>
        `Поздравляю, ${username}, ты побил предыдущий рекорд!`,
      gameType: Games.Hunt,
      items: ITEMS,
      places: PLACES,
      maxWeight: MAX_WEIGHT,
      onMessage: (message: string) =>
        ctx
          .reply(message, { parse_mode: 'Markdown' })
          .then((msg) => removeMessageTimeout(ctx, msg)),
      username: getUserMention(ctx.from),
    });
  }

  async scores(ctx: Context) {
    this.gamesEngineService.getResult({
      chatId: ctx.chat?.id as number,
      gameType: Games.Hunt,
      getTopResultText: (username: string, item: string, weight: number) =>
        `Игрок ${username} застрелил ${item}. Вес: ${weight} кг`,
      notTopText: 'Еще никто никого не подстрелил!',
      resultTitle: 'Самая лучшая дичь:',
      getUserResultText: (item: string, weight: number) =>
        `Твоя лучшая добыча: ${item}, весом ${weight} кило!`,
      username: getUserMention(ctx.from),
      onMessage: (message: string) =>
        ctx
          .reply(message, { parse_mode: 'Markdown' })
          .then((msg) => removeMessageTimeout(ctx, msg)),
    });
  }

  listenEvents() {
    this.bot.command('hunt', this.play);
    this.bot.command('hunt_scores', this.scores);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.listenEvents();
  }
}
