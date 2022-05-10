import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { MongoDBModule } from './mongodb/mongodb.module';
const envModule = ConfigModule.forRoot({
  isGlobal: true,
});
@Module({
  imports: [envModule, MongoDBModule, ScheduleModule.forRoot(), BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
