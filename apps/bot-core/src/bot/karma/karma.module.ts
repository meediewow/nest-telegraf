import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/mongodb/entity/chat.entity';
import { Karma } from 'src/mongodb/entity/karma.entity';
import { KarmaService } from './karma.service';

@Module({
  imports: [TypeOrmModule.forFeature([Karma, Chat])],
  providers: [KarmaService],
})
export class KarmaModule {}
