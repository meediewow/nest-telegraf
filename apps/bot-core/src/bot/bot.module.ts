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
