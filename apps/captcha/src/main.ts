import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { noop } from 'lodash';
import { CaptchaModule } from './captcha.module';
import { captchaServiceOptions } from './options/grpc.options';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    CaptchaModule,
    captchaServiceOptions,
  );
  await app.listen();
  logger.log('CaptchaService is listening...');
}
bootstrap().then(noop);
