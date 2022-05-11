import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
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
              // launchOptions: {
              //   webhook: {
              //     domain: 'https://481c-93-125-10-95.eu.ngrok.io',
              //     hookPath: '/secret-path',
              //   },
              // },
            });
          }, 100);
        });
      },
    }),
    CommandsModule,
    MenuModule,
    EventsModule,
    GamesModule,
  ],
})
export class BotModule {}
