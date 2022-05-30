import { Repository } from 'typeorm';
import { Telegraf } from 'telegraf';
import { noop } from 'lodash';

export type MockType<T> = {
  [P in keyof T]: jest.Mock<Record<string, unknown>>;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<unknown>> =
  jest.fn(() => ({
    findOne: jest.fn(noop),
    findOneOrFail: jest.fn(noop),
    update: jest.fn(noop),
    find: jest.fn(noop),
    save: jest.fn(noop),
  }));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const telegrafMockFactory: () => MockType<Telegraf> = jest.fn(
  () => ({}),
);
