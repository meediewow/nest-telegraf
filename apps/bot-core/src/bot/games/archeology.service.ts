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

const MAX_WEIGHT = 50000;

const PLACES = [
  'в гималаях',
  'в пустыне Гоби',
  'в лунном кратере',
  'в архивах',
  'на горе Арарат',
  'в окрестностях погоста',
  'в морге',
  'на просторах Украины',
  'на горном плато',
  'в старом сортире',
  'на бабушкином огороде',
  'в пустыне Сахаре',
  'на необитаемом острове',
  'в цветочном горшке',
  'в клумбе',
  'в льдах арктики',
  'в песочнице',
  'на первом слое сумрака',
  'на винчестере',
  'в углу',
  'в интернете',
  'в собственной памяти',
  'в кармане',
  'в русле высохшей реки',
  'на дне моря',
];

const ITEMS = [
  'мумию фараона Тутанхамона',
  'обломки грузинской керамики',
  'клад со златом-серебром',
  'икону',
  'скелет',
  'кривой нож',
  'каменный топор',
  'рыцарские доспехи',
  'доски Ноева Ковчега',
  'мамонта',
  'мамонтенка',
  'ледяную глыбу',
  'птеродактиля',
  'метеорит',
  'рубль с Лениным',
  'амулет Мерлина',
  'синий мох',
  'лунный грунт',
  'древний презерватив из бараньей кишки',
  'трубу с туркменским газом',
  'тотем индейцев',
  'деревянную плошку',
  'инсталятор Windows 3.11',
  'библиотеку Ивана Грозного',
];

export class ArcheologyService implements OnModuleInit {
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
            .reply(message, { parse_mode: 'Markdown' })
            .then((msg) => removeMessageTimeout(ctx, msg));
          await delay(1000);
        },
        await this.gamesEngineService.play({
          user,
          chatId,
          cooldownText: 'Полируем лопаты...',
          getFirstMessage: (place: string) =>
            `Вы начали раскопки ${place} и усиленно роете лопатами, экскаватором... Вам кажется что ваш совочек ударился обо что-то твердое. Может это клад?!`,
          getSecondMessage: (item: string, usr: IUser, weight: number) =>
            `Поздравляю, ${getUserMention(
              usr,
            )}! Вы только что выкопали ${item}, возраст - ${weight} лет!`,
          getFailText: (place: string, usr: IUser) =>
            `По уши закопавшись ${place}, ${getUserMention(
              usr,
            )}, нифига вы не выкопали! Может повезет в другом месте?`,
          getLoseText: (usr: IUser) =>
            `Извини, ${getUserMention(usr)}, но это не самая тяжелая находка!`,
          getWinText: (usr: IUser) =>
            `Поздравляю, ${getUserMention(usr)}, ты побил предыдущий рекорд!`,
          gameType: Games.Archeology,
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
            gameType: Games.Archeology,
            getTopResultText: (usr: IUser, item: string, weight: number) =>
              `Игрок ${getUserMention(
                usr,
              )} вырыл ${item}. Возраст артефакта ${weight} лет`,
            notTopText: 'Еще никто ничего не выкопал!',
            resultTitle: 'Самая лучшая раскопка:',
            getUserResultText: (item: string, weight: number) =>
              `Твоя лучшая находка: ${item}, возраст которой ${weight} лет`,
          }),
          { parse_mode: 'Markdown' },
        )
        .then((msg) => {
          removeMessageTimeout(ctx, msg).then(noop);
        });
    }
  }

  listenEvents() {
    this.bot.command('dig', this.play);
    this.bot.command('dig_scores', this.scores);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.listenEvents();
  }
}
