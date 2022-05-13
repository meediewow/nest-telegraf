import { Telegraf } from 'telegraf';
import { TelegrafModuleOptions } from '../interfaces/telegraf-options.interface';

export async function createBotFactory(
  options: TelegrafModuleOptions,
): Promise<Telegraf> {
  const bot = new Telegraf(options.token, options.options);

  bot.use(...(options.middlewares ?? []));

  if (options.launchOptions !== false) {
    await bot.launch(options.launchOptions);
  }

  return bot;
}
