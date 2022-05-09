import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';

@Module({
  imports: [],
  providers: [CommandsService],
})
export class CommandsModule {}
