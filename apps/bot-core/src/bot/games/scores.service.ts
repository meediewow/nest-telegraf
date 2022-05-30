import { Telegraf } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Game } from 'src/mongodb/entity/game.entity';
import { Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Games } from './types/games.enums';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { removeMessageTimeout } from '../utils/message.util';
import { getUserMention } from '../utils/user.util';

export class ScoresService {
  private bot!: Telegraf;

  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
    @InjectRepository(Game)
    private readonly gamesRepository: MongoRepository<Game>,
  ) {
    this.getScores = this.getScores.bind(this);
  }

  async getScores(chatId: number): Promise<string> {
    const games = await this.gamesRepository.find({
      where: { chatId },
    });
    let result: string[] = [];
    games.forEach((i) => {
      switch (i.game) {
        case Games.Archeology: {
          if (i.top) {
            result = [
              ...result,
              `${getUserMention(i.top.user)} стал лучшим археологом, выкопав ${
                i.top.item
              }. Возраст артефакта ${i.top.weight} лет.`,
            ];
          }
          break;
        }
        case Games.Hunt: {
          if (i.top) {
            result = [
              ...result,
              `${getUserMention(
                i.top.user,
              )} стал обладателем рекорда по охоте, добыв ${
                i.top.item
              }, весом в ${i.top.weight} кило.`,
            ];
          }
          break;
        }
        case Games.Fish: {
          if (i.top) {
            result = [
              ...result,
              `${getUserMention(
                i.top.user,
              )} удерживает рекорд по рыбалке, поймав ${i.top.item}, весом в ${
                i.top.weight
              } кило.`,
            ];
          }
          break;
        }
        default: {
          result = [...result, 'игра отсутствует'];
          break;
        }
      }
    });
    return result.join('\n\n');
  }

  async listenEvents() {
    this.bot.command('total_scores', async (ctx) => {
      const message = await this.getScores(ctx.message.chat.id);
      ctx
        .reply(message, {
          parse_mode: 'Markdown',
        })
        .then((msg) => removeMessageTimeout(ctx, msg));
    });
  }

  async onModuleInit(): Promise<void> {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    await this.listenEvents();
  }
}
