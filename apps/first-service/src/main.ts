import { NestFactory } from '@nestjs/core';
import { FirstServiceModule } from './first-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FirstServiceModule);
  await app.listen(3001);
}
bootstrap();
