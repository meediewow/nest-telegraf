import { ClientOptions, Transport } from '@nestjs/microservices';
import { resolve } from 'path';

export const captchaServiceOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'captcha',
    url: '0.0.0.0:3001',
    protoPath: resolve('dist/libs/protobufs/protos/captcha.proto'),
  },
};
