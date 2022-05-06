import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafCoreModule } from './bot/bot.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TelegrafCoreModule.forRootAsync({
      useFactory: async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: '5376873227:AAFnj37RtcTvVyHboDTn8yGTRaxxGv17vXo',
            });
          }, 1000);
        });
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
