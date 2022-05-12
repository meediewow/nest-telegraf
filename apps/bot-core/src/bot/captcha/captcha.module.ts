import { Module } from '@nestjs/common';
import { EventsService } from './captcha.service';

@Module({
  imports: [],
  providers: [EventsService],
})
export class CaptchaModule {}
