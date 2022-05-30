import { Games } from 'src/bot/games/types/games.enums';
import { Game, IResult } from 'src/mongodb/entity/game.entity';
import { ObjectID } from 'typeorm';

export const game: Game = {
  chatId: 1,
  game: Games.Archeology,
  id: 1 as unknown as ObjectID,
  isReady: true,
  results: [],
};

export const topResult: IResult = {
  item: 'TestItem',
  place: 'TestPlace',
  user: {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
  },
  weight: 100,
};

export const gameWithTop: Game = {
  ...game,
  top: topResult,
  results: [topResult],
};

export const games: Game[] = [
  gameWithTop,
  {
    ...gameWithTop,
    game: Games.Fish,
  },
  {
    ...gameWithTop,
    game: Games.Hunt,
  },
];
