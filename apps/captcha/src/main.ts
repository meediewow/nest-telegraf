import { NestFactory } from '@nestjs/core';
import { CaptchaModule } from './captcha.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { resolve } from 'path';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(CaptchaModule, {
    transport: Transport.GRPC,
    options: {
      package: 'captcha',
      url: '0.0.0.0:3001',
      protoPath: resolve('dist/libs/protobufs/captcha.proto'),
    },
  });
  app.listen(() => {
    logger.log('Microservice is listening...');
  });
}
bootstrap();
