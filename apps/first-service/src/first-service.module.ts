import { Module } from '@nestjs/common';
import { FirstServiceController } from './first-service.controller';
import { FirstServiceService } from './first-service.service';

@Module({
  imports: [],
  controllers: [FirstServiceController],
  providers: [FirstServiceService],
})
export class FirstServiceModule {}
