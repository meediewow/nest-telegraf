import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/mongodb/entity/game.entity';
import { ArcheologyService } from './archeology.service';
import { GamesEngineService } from './engine/games-engine.service';
import { FishService } from './fish.service';
import { HuntService } from './hunt.service';
import { ScoresService } from './scores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [
    GamesEngineService,
    HuntService,
    FishService,
    ArcheologyService,
    ScoresService,
  ],
})
export class GamesModule {}
