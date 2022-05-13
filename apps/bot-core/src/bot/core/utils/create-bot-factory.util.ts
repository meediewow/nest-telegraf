import { Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { TelegrafModuleOptions } from '../interfaces/telegraf-options.interface';
import * as Sentry from '@sentry/node';

export async function createBotFactory(
  options: TelegrafModuleOptions,
): Promise<Telegraf> {
  const bot = new Telegraf(options.token, options.options);

  bot.use(...(options.middlewares ?? []));

  if (options.launchOptions !== false) {
    await bot.launch(options.launchOptions);
  }

  bot.catch((err) => {
    Logger.error(err);
    Sentry.captureException(err);
  });

  return bot;
}
