import { Module } from '@nestjs/common';
import { TextService } from './text.service';

@Module({
  imports: [],
  providers: [TextService],
})
export class TextModule {}
