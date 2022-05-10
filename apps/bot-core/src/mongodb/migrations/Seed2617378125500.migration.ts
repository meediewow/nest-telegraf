import { MigrationInterface, QueryRunner } from 'typeorm';
import { Game } from '../entity/game.entity';

export class Seed2617378125500 implements MigrationInterface {
  name = 'Seed2617378125500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(
      queryRunner.manager.create<Game>(Game, {
        game: 1, // Games.Archeology,
        isReady: true,
        results: [],
      }),
    );
    await queryRunner.manager.save(
      queryRunner.manager.create<Game>(Game, {
        game: 3, // Games.Hunt,
        isReady: true,
        results: [],
      }),
    );
    await queryRunner.manager.save(
      queryRunner.manager.create<Game>(Game, {
        game: 4, // Games.Fish,
        isReady: true,
        results: [],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM games`);
  }
}
