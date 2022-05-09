import { Module } from '@nestjs/common';
import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';

@Module({
  imports: [],
  controllers: [CaptchaController],
  providers: [CaptchaService],
})
export class CaptchaModule {}
