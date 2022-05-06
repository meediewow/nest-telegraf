import { Injectable } from '@nestjs/common';

@Injectable()
export class FirstServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
