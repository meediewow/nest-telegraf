import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Game } from 'src/mongodb/entity/game.entity';
import { getRandomInt } from 'src/bot/utils/number.util';
import { IUser } from 'src/types/telegram.type';
import { Games } from '../types/games.enums';

// Seconds
const PAUSE_BEFORE_START = 10;

interface IBasic {
  gameType: Games;
  chatId: number;
  user: IUser;
}

interface IPlayMessages {
  cooldownText: string;
  getFirstMessage: (place: string) => string;
  getSecondMessage: (item: string, user: IUser, weight: number) => string;
  getFailText: (places: string, user: IUser) => string;
  getWinText: (user: IUser) => string;
  getLoseText: (user: IUser) => string;
}

interface IResultMessages {
  resultTitle: string;
  getTopResultText: (user: IUser, item: string, weight: number) => string;
  notTopText: string;
  getUserResultText: (item: string, weight: number) => string;
}

interface IPlay extends IBasic, IPlayMessages {
  maxWeight: number;
  places: string[];
  items: string[];
}

interface IGetResult extends Omit<IBasic, 'onMessage'>, IResultMessages {}

@Injectable()
export class GamesEngineService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: MongoRepository<Game>,
  ) {}

  private static getEntity(entities: string[]): string {
    return entities[getRandomInt(0, entities.length - 1)];
  }

  private static getRandomWeight(maxWeight: number): number {
    return Math.round(getRandomInt(0, maxWeight) * Math.random());
  }

  private async getGame(gameType: Games, chatId: number) {
    const game = await this.gamesRepository.findOne({
      where: {
        game: gameType,
        chatId,
      },
    });
    if (!game) {
      return this.gamesRepository.save({
        game: gameType,
        chatId,
        isReady: true,
        results: [],
      });
    }
    return game;
  }

  public async play(config: IPlay): Promise<string[]> {
    let output: string[] = [];
    const game = await this.getGame(config.gameType, config.chatId);

    if (game.isReady) {
      await this.gamesRepository.update(game.id, {
        isReady: false,
      });
      // add start time
      setTimeout(async () => {
        await this.gamesRepository.update((game as Game).id, {
          isReady: true,
        });
      }, PAUSE_BEFORE_START * 1000);

      const currentResult = {
        place: GamesEngineService.getEntity(config.places),
        item: GamesEngineService.getEntity(config.items),
        weight: GamesEngineService.getRandomWeight(config.maxWeight),
        user: config.user,
      };

      const isEmpty = getRandomInt(1, 3) === 1;

      output = [...output, config.getFirstMessage(currentResult.place)];

      if (!isEmpty) {
        output = [
          ...output,
          config.getSecondMessage(
            currentResult.item,
            currentResult.user,
            currentResult.weight,
          ),
        ];

        const isWinner = game.top
          ? game.top?.weight < currentResult.weight
          : true;
        const existedResult = game.results.find(
          (i) => i.user?.id === currentResult.user.id,
        );

        if (existedResult && existedResult.weight < currentResult.weight) {
          await this.gamesRepository.update(game.id, {
            results: game.results.map((i) => {
              if (i.user.id === currentResult.user.id) {
                return currentResult;
              }
              return i;
            }),
          });
        } else if (!existedResult) {
          await this.gamesRepository.update(game.id, {
            results: [...game.results, currentResult],
          });
        }
        if (isWinner) {
          await this.gamesRepository.update(game.id, {
            top: currentResult,
          });
          output = [...output, config.getWinText(currentResult.user)];
        } else {
          output = [...output, config.getLoseText(currentResult.user)];
        }
      } else {
        output = [
          ...output,
          config.getFailText(currentResult.place, currentResult.user),
        ];
      }
    } else {
      output = [...output, config.cooldownText];
    }
    return output;
  }

  async result(config: IGetResult): Promise<string> {
    const gameStore = await this.gamesRepository.findOne({
      where: {
        game: config.gameType,
        chatId: config.chatId,
      },
    });
    if (gameStore && gameStore.top) {
      const currentUser = config.user.id;
      const userResult = gameStore.results.find(
        (i) => i.user.id === currentUser,
      );

      const userResultText = userResult
        ? `\n${config.getUserResultText(userResult.item, userResult.weight)}`
        : '';

      return `${config.resultTitle}\n${config.getTopResultText(
        gameStore.top.user,
        gameStore.top.item,
        gameStore.top.weight,
      )}${userResultText}`;
    }

    return config.notTopText;
  }
}
