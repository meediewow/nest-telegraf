import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';

@Module({
  imports: [],
  providers: [MenuService],
})
export class MenuModule {}
