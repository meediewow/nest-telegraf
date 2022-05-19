import { Context, Telegraf } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Game } from 'src/mongodb/entity/game.entity';
import { Games } from './types/games.enums';
import { Inject } from '@nestjs/common';
import { TELEGRAF_BOT_NAME } from '../core/telegraf.constants';
import { ModuleRef } from '@nestjs/core';
import { removeMessageTimeout } from '../utils/message.util';

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

  async getScores(ctx: Context) {
    const games = await this.gamesRepository.find({
      where: { chatId: ctx.message?.chat.id },
    });

    const reply = (message: string) => {
      return ctx
        .reply(message, { parse_mode: 'Markdown' })
        .then((msg) => removeMessageTimeout(ctx, msg));
    };
    let result: string[] = [];
    games.forEach(async (i) => {
      switch (i.game) {
        case Games.Archeology: {
          if (i.top) {
            result = [
              ...result,
              `${i.top.username} стал лучшим археологом, выкопав ${i.top.item}. Возраст артефакта ${i.top.weight} лет.`,
            ];
          }
          break;
        }
        case Games.Hunt: {
          if (i.top) {
            result = [
              ...result,
              `${i.top.username} стал обладателем рекорда по охоте, добыв ${i.top.item}, весом в ${i.top.weight} кило.`,
            ];
          }
          break;
        }
        case Games.Fish: {
          if (i.top) {
            result = [
              ...result,
              `${i.top.username} удерживает рекорд по рыбалке, поймав ${i.top.item}, весом в ${i.top.weight} кило.`,
            ];
          }
          break;
        }
      }
    });
    reply(result.join('\n\n'));
  }

  listenEvents() {
    this.bot.command('total_scores', this.getScores);
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Telegraf>(this.botName, {
      strict: false,
    });
    this.listenEvents();
  }
}
