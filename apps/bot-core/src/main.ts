import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { getBotToken } from './bot/core/utils/get-bot-token.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const bot = app.get(getBotToken());
  // app.use(bot.webhookCallback('/secret-path'));
  await app.listen(process.env.CORE_PORT || 3000);
}
bootstrap();
