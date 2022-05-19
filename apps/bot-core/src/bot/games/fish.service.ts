import { Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Context, Telegraf } from 'telegraf';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { removeMessageTimeout } from '../utils/message.util';
import { getUserMention } from '../utils/user.util';
import { GamesEngineService } from './engine/games-engine.service';
import { Games } from './types/games.enums';

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
    this.gamesEngineService.play({
      chatId: ctx.chat?.id as number,
      cooldownText: 'Натягиваем леску...',
      getFirstMessage: (place: string) =>
        `Вы забрасываете бамбуковую удочку в ${place}. Вы чувствуете поклевку и начинаете быстро тащить что-то из воды`,
      getSecondMessage: (item: string, username: string, weight: number) =>
        `Поздравляю, ${username}! Вы только что выловили ${item} весом ${weight} кило!`,
      getFailText: (place: string, username: string) =>
        `Черт, твоя рыбка сорвалась, ${username}. Не беда, может потом повезет?`,
      getLoseText: (username: string) =>
        `Извини, ${username}, но это не самая тяжелая находка!`,
      getWinText: (username: string) =>
        `Поздравляю, ${username}, ты побил предыдущий рекорд!`,
      gameType: Games.Fish,
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
      gameType: Games.Fish,
      getTopResultText: (username: string, item: string, weight: number) =>
        `Игрок ${username} выловил ${item}. Вес: ${weight} кг`,
      notTopText: 'Еще никто ничего не споймал!',
      resultTitle: 'Самый лучший улов:',
      getUserResultText: (item: string, weight: number) =>
        `Твой лучший улов: ${item}, весом ${weight} кило!`,
      username: getUserMention(ctx.from),
      onMessage: (message: string) =>
        ctx
          .reply(message, { parse_mode: 'Markdown' })
          .then((msg) => removeMessageTimeout(ctx, msg)),
    });
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
