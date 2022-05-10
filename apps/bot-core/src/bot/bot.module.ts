import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from './core/core.module';
import { EventsModule } from './events/events.module';
import { GamesModule } from './games/games.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    TelegrafCoreModule.forRootAsync({
      useFactory: async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: process.env.BOT_TOKEN,
            });
          }, 100);
        });
      },
    }),
    MenuModule,
    EventsModule,
    GamesModule,
  ],
})
export class BotModule {}
