import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from 'src/mongodb/entity/game.entity';
import { Repository } from 'typeorm';
import { Games } from 'src/bot/games/types/games.enums';
import { mockedPlayConfig, mockedScoresConfig } from './mocks/config.mock';
import { GamesEngineService } from '../games-engine.service';
import { repositoryMockFactory } from '../../../utils/spec.util';
import { game, gameWithTop } from '../../specs/mocks/game.mock';

describe('GamesEngineService', () => {
  let service: GamesEngineService;
  let repo: Repository<Game>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamesEngineService,
        {
          provide: getRepositoryToken(Game),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    service = await module.get(GamesEngineService);
    repo = module.get<Repository<Game>>(getRepositoryToken(Game));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a not top text (has not top result)', async () => {
    const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValueOnce(game);
    const result = await service.result(mockedPlayConfig);

    expect(result).toEqual(mockedPlayConfig.notTopText);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
  });

  it('should return a not top text (not initialized)', async () => {
    const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    const result = await service.result(mockedPlayConfig);

    expect(result).toEqual(mockedScoresConfig.notTopText);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
  });

  it('should return results (user not played)', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce(gameWithTop);

    const result = await service.result({
      ...mockedPlayConfig,
      user: { ...mockedPlayConfig.user, id: 2 },
    });

    expect(result).toEqual(
      `${
        mockedPlayConfig.resultTitle
      }\n${mockedScoresConfig.getTopResultText()}`,
    );
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
  });

  it('should return results (user was played)', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce(gameWithTop);

    const result = await service.result(mockedScoresConfig);

    expect(result).toEqual(
      `${
        mockedPlayConfig.resultTitle
      }\n${mockedPlayConfig.getTopResultText()}\n${mockedPlayConfig.getUserResultText()}`,
    );
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
  });

  it('play: should be send cooldown text', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce({ ...game, isReady: false });

    const output = await service.play({
      ...mockedPlayConfig,
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
    });

    expect(output).toEqual(['cooldownText']);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
  });

  it('play: should be empty game', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce({ ...game, isReady: true });
    const updateSpy = jest.spyOn(repo, 'update');
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1);

    const output = await service.play({
      ...mockedPlayConfig,
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
    });
    expect(output).toEqual(['firstMessage', 'failText']);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(game.id, { isReady: false });
  });

  it('play: should be success game (user is top)', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce({ ...game, isReady: true });
    const updateSpy = jest.spyOn(repo, 'update');
    jest.spyOn(global.Math, 'random').mockReturnValue(0.8);

    const output = await service.play({
      ...mockedPlayConfig,
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
    });
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
    expect(output).toEqual(['firstMessage', 'secondMessage', 'winText']);

    expect(updateSpy).toHaveBeenCalledTimes(3);
    expect(updateSpy).toHaveBeenCalledWith(game.id, { isReady: false });
  });

  it('play: should be success game (user is not top)', async () => {
    const findOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValueOnce({ ...game, isReady: true });
    const updateSpy = jest.spyOn(repo, 'update');
    jest
      .spyOn(global.Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValue(0.1);

    const output = await service.play({
      ...mockedPlayConfig,
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
    });
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
    expect(output).toEqual(['firstMessage', 'failText']);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(game.id, { isReady: false });
  });

  it('play: should be success game (game is not initialized)', async () => {
    const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    const saveGameSpy = jest.spyOn(repo, 'save').mockResolvedValueOnce(game);
    const updateSpy = jest.spyOn(repo, 'update');

    jest.spyOn(global.Math, 'random').mockReturnValue(0.8);

    const output = await service.play({
      ...mockedPlayConfig,
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
    });
    expect(saveGameSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        game: mockedPlayConfig.gameType,
        chatId: mockedPlayConfig.chatId,
      },
    });
    expect(output).toEqual(['firstMessage', 'secondMessage', 'winText']);

    expect(updateSpy).toHaveBeenCalledTimes(3);
    expect(updateSpy).toHaveBeenCalledWith(game.id, { isReady: false });
  });
});
