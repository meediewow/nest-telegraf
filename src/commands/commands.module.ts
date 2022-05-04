import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from 'src/bot/bot.module';
import { CommandsService } from './commands.service';

@Module({
  imports: [TelegrafCoreModule],
  providers: [CommandsService],
})
export class CommandsModule {}
