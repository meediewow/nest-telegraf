import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { TelegrafCoreModule } from './core/core.module';
import { CaptchaModule } from './captcha/captcha.module';
import { GamesModule } from './games/games.module';
import { MenuModule } from './menu/menu.module';
import { KarmaModule } from './karma/karma.module';

@Module({
  imports: [
    TelegrafCoreModule.forRootAsync({
      useFactory: async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: process.env.BOT_TOKEN as string,
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
    CaptchaModule,
    GamesModule,
    KarmaModule,
  ],
})
export class BotModule {}
