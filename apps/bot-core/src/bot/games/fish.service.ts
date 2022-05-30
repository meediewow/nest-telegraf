import { Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IUser } from 'src/types/telegram.type';
import { Context, Telegraf } from 'telegraf';
import { noop } from 'lodash';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { removeMessageTimeout } from '../utils/message.util';
import { getUserMention } from '../utils/user.util';
import { GamesEngineService } from './engine/games-engine.service';
import { Games } from './types/games.enums';
import { delay, useAsyncForEach } from '../utils/helpers.util';

const MAX_WEIGHT = 600;

const PLACES = [
  'озеро',
  'реку',
  'северерный ледовитый океан',
  'индийский океан',
  'биде',
  'детский плавательный бассейн',
  'туалет',
  'раковину',
  'слив ванной',
  'лужу грязи',
  'ведро воды',
  'ванную',
  'бочку с дождевой водой',
  'аквариум',
  'чашку кофе',
  'стакан молока',
  'черную дыру',
  'дно чернобыльского реактора',
];

const ITEMS = [
  'сальмонеллу',
  'селёдку',
  'желтоперого тунца',
  'розовую сальмонеллу',
  'голавля',
  'барбуса',
  'окуня',
  'верхоплавку',
  'коричневую форель',
  'полярника',
  'плотву',
  'зубатку',
  'солнечную рыбу',
  'старую шину',
  'скользкую корягу',
  'лампу джина',
  'любовное послание в бутылке',
  'старое бревно',
  'резиновый сапог',
  'лох-несское чудовище',
  'старую рыбацкую приманку',
  'кусок титаника',
  'обломок атлантиды',
  'кита',
  'кальмара',
  'дельфина',
  'ската',
  'подводную лодку',
  'медузу',
  'морскую звезду',
  'электрического угря',
  'большую белую акулу',
  'аквалангиста',
  'сырую пачку сигарет',
  'водоросли',
  'якорь от лодки',
  'водяного',
  'русалку',
  'палтуса',
];

export class FishService implements OnModuleInit {
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
            `Вы забрасываете бамбуковую удочку в ${place}. Вы чувствуете поклевку и начинаете быстро тащить что-то из воды`,
          getSecondMessage: (item: string, usr: IUser, weight: number) =>
            `Поздравляю, ${getUserMention(
              usr,
            )}! Вы только что выловили ${item} весом ${weight} кило!`,
          getFailText: (place: string, usr: IUser) =>
            `Черт, твоя рыбка сорвалась, ${getUserMention(
              usr,
            )}. Не беда, может потом повезет?`,
          getLoseText: (usr: IUser) =>
            `Извини, ${getUserMention(usr)}, но это не самая тяжелая находка!`,
          getWinText: (usr: IUser) =>
            `Поздравляю, ${getUserMention(usr)}, ты побил предыдущий рекорд!`,
          gameType: Games.Fish,
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
              `Игрок ${getUserMention(usr)} выловил ${item}. Вес: ${weight} кг`,
            notTopText: 'Еще никто ничего не споймал!',
            resultTitle: 'Самый лучший улов:',
            getUserResultText: (item: string, weight: number) =>
              `Твой лучший улов: ${item}, весом ${weight} кило!`,
          }),
          { parse_mode: 'Markdown' },
        )
        .then((msg) => {
          removeMessageTimeout(ctx, msg).then(noop);
        });
    }
  }

  listenEvents() {
    this.bot.command('fish', this.play);
    this.bot.command('fish_scores', this.scores);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.listenEvents();
  }
}
