import { NestFactory } from '@nestjs/core';
import { CaptchaModule } from './captcha.module';
import { Logger } from '@nestjs/common';
import { captchaServiceOptions } from './options/grpc.options';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    CaptchaModule,
    captchaServiceOptions,
  );
  app.listen(() => {
    logger.log('CaptchaService is listening...');
  });
}
bootstrap();
