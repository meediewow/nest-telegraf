import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from './core/core.module';
import { EventsModule } from './events/events.module';
import { GamesModule } from './games/games.module';
import { MenuModule } from './menu/menu.module';

console.log(process.env.BOT_TOKEN, process.env.DB_URL, process.env.CORE_PORT);

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
