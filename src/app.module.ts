import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from './bot/bot.module';
import { CommandsModule } from './commands/commands.module';
import { TextModule } from './text/text.module';

@Module({
  imports: [
    TelegrafCoreModule.forRoot({
      token: '5376873227:AAFnj37RtcTvVyHboDTn8yGTRaxxGv17vXo',
    }),
    CommandsModule,
    TextModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
