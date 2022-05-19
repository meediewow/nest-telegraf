import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClusterService } from './cluster/cluster.service';
import { getBotToken } from './bot/core/utils/get-bot-token.util';
import { Telegraf } from 'telegraf';

const workerEntry = async () => {
  const app = await NestFactory.create(AppModule);
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/secret'));

  await app.listen(process.env.CORE_PORT || 3000);
};

const masterEntry = async () => {
  if (ClusterService.processCount > 1) {
    const bot = new Telegraf(process.env.BOT_TOKEN as string);
    bot.telegram.setWebhook((process.env.WEBHOOK_URL + '/secret') as string);
  }
};

ClusterService.createCluster(workerEntry, masterEntry, 1);
