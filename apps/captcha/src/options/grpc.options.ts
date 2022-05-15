import { Transport } from '@nestjs/microservices';
import { resolve } from 'path';

export const captchaServiceOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'captcha',
    url: `0.0.0.0:${process.env.CAPTCHA_SERVICE_PORT || 3001}`,
    protoPath: resolve('dist/libs/protobufs/protos/captcha.proto'),
  },
};
