import { Module } from '@nestjs/common';
import { EventsService } from './events.service';

@Module({
  imports: [],
  providers: [EventsService],
})
export class EventsModule {}
