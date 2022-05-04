import { Module } from '@nestjs/common';
import { TelegrafCoreModule } from 'src/bot/bot.module';
import { TextService } from './text.service';

@Module({
  imports: [TelegrafCoreModule],
  providers: [TextService],
})
export class TextModule {}
