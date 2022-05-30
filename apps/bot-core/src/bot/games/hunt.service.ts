import { Inject, OnModuleInit } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { ModuleRef } from '@nestjs/core';
import { noop } from 'lodash';
import { GamesEngineService } from './engine/games-engine.service';
import { Games } from './types/games.enums';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { getUserMention } from '../utils/user.util';
import { removeMessageTimeout } from '../utils/message.util';
import { delay, useAsyncForEach } from '../utils/helpers.util';
import { IUser } from '../../types/telegram.type';

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
    const user = ctx.from;
    const chatId = ctx.chat?.id;
    if (user && chatId) {
      useAsyncForEach<string>(
        async (message) => {
          ctx
            .reply(message, {
              parse_mode: 'Markdown',
            })
            .then((msg) => {
              removeMessageTimeout(ctx, msg).then(noop);
            });
          await delay(1000);
        },
        await this.gamesEngineService.play({
          user,
          chatId,
          cooldownText: 'Натягиваем леску...',
          getFirstMessage: (place: string) =>
            `Вы затаились в ${place} и поджидаете... Вы что-то слышите и стреляете в том направлении...`,
          getSecondMessage: (item: string, usr: IUser, weight: number) =>
            `Поздравляю, ${getUserMention(
              usr,
            )}!  Вы только что положили в свой мешок ${item} весом в ${weight} кило!`,
          getFailText: (place: string, usr: IUser) =>
            `Крысы... вы промахнулись, ${getUserMention(
              usr,
            )}. Может потом повезет?`,
          getLoseText: (usr: IUser) =>
            `Извини, ${getUserMention(usr)}, но это не самая тяжелая находка!`,
          getWinText: (usr: IUser) =>
            `Поздравляю, ${getUserMention(usr)}, ты побил предыдущий рекорд!`,
          gameType: Games.Hunt,
          items: ITEMS,
          places: PLACES,
          maxWeight: MAX_WEIGHT,
        }),
      ).then(noop);
    }
  }

  async scores(ctx: Context) {
    const user = ctx.from;
    const chatId = ctx.chat?.id;
    if (user && chatId) {
      ctx
        .reply(
          await this.gamesEngineService.result({
            user,
            chatId,
            gameType: Games.Fish,
            getTopResultText: (usr: IUser, item: string, weight: number) =>
              `Игрок ${getUserMention(
                usr,
              )} застрелил ${item}. Вес: ${weight} кг`,
            notTopText: 'Еще никто никого не подстрелил!',
            resultTitle: 'Самая лучшая дичь:',
            getUserResultText: (item: string, weight: number) =>
              `Твоя лучшая добыча: ${item}, весом ${weight} кило!`,
          }),
          { parse_mode: 'Markdown' },
        )
        .then((msg) => {
          removeMessageTimeout(ctx, msg).then(noop);
        });
    }
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
