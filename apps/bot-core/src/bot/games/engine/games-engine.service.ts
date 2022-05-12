import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Game } from 'src/mongodb/entity/game.entity';
import { Games } from '../types/games.enums';
import { getRandomInt } from 'src/bot/core/utils/number.utils';

const PAUSE_BEFORE_START = 10; //sec

interface IBasic {
  gameType: Games;
  chatId: number;
  onMessage: (message: string) => Promise<any>;
  username: string;
}

interface IPlayMessages {
  cooldownText: string;
  getFirstMessage: (place: string) => string;
  getSecondMessage: (item: string, username: string, weight: number) => string;
  getFailText: (places: string, username: string) => string;
  getWinText: (username: string) => string;
  getLoseText: (username: string) => string;
}

interface IResultMessages {
  resultTitle: string;
  getTopResultText: (username: string, item: string, weight: number) => string;
  notTopText: string;
  getUserResultText: (item: string, weight: number) => string;
}

interface IPlay extends IBasic, IPlayMessages {
  maxWeight: number;
  places: string[];
  items: string[];
}

interface IGetResult extends IBasic, IResultMessages {}

@Injectable()
export class GamesEngineService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: MongoRepository<Game>,
  ) {}

  private getEntity(entities: string[]): string {
    return entities[getRandomInt(0, entities.length - 1)];
  }

  private getRandomWeight(maxWeight: number): number {
    return Math.round(getRandomInt(0, maxWeight) * Math.random());
  }

  public async play(config: IPlay) {
    let gameStore = await this.gamesRepository.findOne({
      where: {
        game: config.gameType,
        chatId: config.chatId,
      },
    });

    if (!gameStore) {
      gameStore = await this.gamesRepository.save({
        game: config.gameType,
        chatId: config.chatId,
        isReady: true,
        results: [],
      });
    }

    if (!gameStore.isReady) {
      await config.onMessage(config.cooldownText);
      return;
    } else {
      await this.gamesRepository.update(gameStore.id, {
        isReady: false,
      });
      setTimeout(async () => {
        await this.gamesRepository.update(gameStore.id, {
          isReady: true,
        });
      }, PAUSE_BEFORE_START * 1000);
    }

    const currentResult = {
      place: this.getEntity(config.places),
      item: this.getEntity(config.items),
      weight: this.getRandomWeight(config.maxWeight),
      username: config.username,
    };

    const isEmpty = getRandomInt(1, 3) === 1;
    await config.onMessage(config.getFirstMessage(currentResult.place));

    setTimeout(async () => {
      if (isEmpty) {
        await config.onMessage(
          config.getFailText(currentResult.place, currentResult.username),
        );
        return;
      }
      await config.onMessage(
        config.getSecondMessage(
          currentResult.item,
          currentResult.username,
          currentResult.weight,
        ),
      );
    }, 1000);

    if (!isEmpty) {
      const isWinner = gameStore.top
        ? gameStore.top?.weight < currentResult.weight
        : true;
      const existedResult = gameStore.results.find(
        (i) => i.username === currentResult.username,
      );

      if (!!existedResult && existedResult.weight < currentResult.weight) {
        await this.gamesRepository.update(gameStore.id, {
          results: gameStore.results.map((i) => {
            if (i.username === currentResult.username) {
              return currentResult;
            } else {
              return i;
            }
          }),
        });
      } else if (!existedResult) {
        await this.gamesRepository.update(gameStore.id, {
          results: [...gameStore.results, currentResult],
        });
      }
      if (isWinner) {
        await this.gamesRepository.update(gameStore.id, {
          top: currentResult,
        });
        setTimeout(async () => {
          await config.onMessage(config.getWinText(currentResult.username));
        }, 2500);
      } else {
        setTimeout(async () => {
          await config.onMessage(config.getLoseText(currentResult.username));
        }, 2500);
      }
    }
  }

  async getResult(config: IGetResult) {
    const gameStore = await this.gamesRepository.findOne({
      where: {
        game: config.gameType,
        chatId: config.chatId,
      },
    });

    if (!gameStore) {
      await config.onMessage(config.notTopText);
      return;
    }

    const currentUser = config.username;
    const userResult = gameStore.results.find(
      (i) => i.username === currentUser,
    );
    if (gameStore.top) {
      await config.onMessage(config.resultTitle);
      await config.onMessage(
        config.getTopResultText(
          gameStore.top.username,
          gameStore.top.item,
          gameStore.top.weight,
        ),
      );
    } else {
      await config.onMessage(config.notTopText);
    }

    if (userResult) {
      await config.onMessage(
        config.getUserResultText(userResult.item, userResult.weight),
      );
    }
  }
}
