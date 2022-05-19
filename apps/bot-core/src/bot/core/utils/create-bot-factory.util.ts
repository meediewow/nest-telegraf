import { Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { TelegrafModuleOptions } from '../interfaces/telegraf-options.interface';
import * as Sentry from '@sentry/node';
import { ClusterService } from 'src/cluster/cluster.service';

export async function createBotFactory(
  options: TelegrafModuleOptions,
): Promise<Telegraf> {
  const bot = new Telegraf(options.token, options.options);

  bot.use(...(options.middlewares ?? []));

  if (ClusterService.processCount > 1) {
    await bot.launch({
      webhook: {
        domain:
          process.env.WEBHOOK_URL || 'https://1f3a-93-125-10-95.eu.ngrok.io',
        hookPath: '/secret',
      },
    });
  } else if (ClusterService.processCount === 1) {
    await bot.startPolling();
  }

  bot.catch((err) => {
    Logger.error(err);
    Sentry.captureException(err);
  });

  return bot;
}
