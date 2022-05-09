import { Module } from '@nestjs/common';
import { ProtobufsService } from './protobufs.service';

@Module({
  providers: [ProtobufsService],
  exports: [ProtobufsService],
})
export class ProtobufsModule {}
