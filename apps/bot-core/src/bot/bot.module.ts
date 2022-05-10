import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from './core/core.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
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
    EventsModule,
  ],
})
export class BotModule {}
