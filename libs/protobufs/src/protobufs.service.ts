import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtobufsService {
  getProto() {
    return 'test';
  }
}
