import { Games } from 'src/bot/games/types/games.enums';

export const mockedScoresConfig = {
  chatId: 1,
  gameType: Games.Archeology,
  user: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
  },
  notTopText: 'notTopText',
  getTopResultText: () => 'getTopResultText',
  getUserResultText: () => 'getUserResultText',
  resultTitle: 'resultTitle',
};

export const mockedPlayConfig = {
  ...mockedScoresConfig,
  cooldownText: 'cooldownText',
  getFailText: () => 'failText',
  getFirstMessage: () => 'firstMessage',
  getSecondMessage: () => 'secondMessage',
  getWinText: () => 'winText',
  items: ['test1', 'test2'],
  maxWeight: 10,
  places: ['testPlace1', 'testPlace2'],
  gameType: Games.Archeology,
  getLoseText: () => 'lostText',
};
