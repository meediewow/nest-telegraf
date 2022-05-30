import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { BotModule } from './bot/bot.module';
import { MongoDBModule } from './mongodb/mongodb.module';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [
    envModule,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.APP_ENV,
    }),
    MongoDBModule,
    ScheduleModule.forRoot(),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
