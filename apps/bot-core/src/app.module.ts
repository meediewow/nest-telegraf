import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [ScheduleModule.forRoot(), BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
