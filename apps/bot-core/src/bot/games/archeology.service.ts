import { Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Context, Telegraf } from 'telegraf';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { getUserMention } from '../utils/user';
import { GamesEngineService } from './engine/games-engine.service';
import { Games } from './types/games.enums';

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
  private bot: Telegraf<any>;

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
      chatId: ctx.chat.id,
      cooldownText: 'Полируем лопаты...',
      getFirstMessage: (place: string) =>
        `Вы начали раскопки ${place} и усиленно роете лопатами, экскаватором... Вам кажется что ваш совочек ударился обо что-то твердое. Может это клад?!`,
      getSecondMessage: (item: string, username: string, weight: number) =>
        `Поздравляю, ${username}! Вы только что выкопали ${item}, возраст - ${weight} лет!`,
      getFailText: (place: string, username: string) =>
        `По уши закопавшись ${place}, ${username}, нифига вы не выкопали! Может повезет в другом месте?`,
      getLoseText: (username: string) =>
        `Извини, ${username}, но это не самая тяжелая находка!`,
      getWinText: (username: string) =>
        `Поздравляю, ${username}, ты побил предыдущий рекорд!`,
      gameType: Games.Archeology,
      items: ITEMS,
      places: PLACES,
      maxWeight: MAX_WEIGHT,
      onMessage: (message: string) =>
        ctx.reply(message, { parse_mode: 'Markdown' }),
      username: getUserMention(ctx.from),
    });
  }

  async scores(ctx: Context) {
    this.gamesEngineService.getResult({
      chatId: ctx.chat.id,
      gameType: Games.Archeology,
      getTopResultText: (username: string, item: string, weight: number) =>
        `Игрок ${username} вырыл ${item}. Возраст артефакта ${weight} лет`,
      notTopText: 'Еще никто ничего не выкопал!',
      resultTitle: 'Самая лучшая раскопка:',
      getUserResultText: (item: string, weight: number) =>
        `Твоя лучшая находка: ${item}, возраст которой ${weight} лет`,
      username: getUserMention(ctx.from),
      onMessage: (message: string) =>
        ctx.reply(message, { parse_mode: 'Markdown' }),
    });
  }

  listenEvents() {
    this.bot.command('dig', this.play);
    this.bot.command('dig_scores', this.scores);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf<any>>(this.botName, {
      strict: false,
    });
    this.listenEvents();
  }
}
