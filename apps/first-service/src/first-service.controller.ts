import { Controller, Get } from '@nestjs/common';
import { FirstServiceService } from './first-service.service';

@Controller()
export class FirstServiceController {
  constructor(private readonly firstServiceService: FirstServiceService) {}

  @Get()
  hello(): string {
    return this.firstServiceService.getHello();
  }
}
