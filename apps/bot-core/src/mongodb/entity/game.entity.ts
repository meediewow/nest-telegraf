import { IUser } from 'src/types/telegram.type';
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

export interface IResult {
  tool?: string;
  place: string;
  item: string;
  weight: number;
  user: IUser;
}

@Entity('games')
export class Game {
  @ObjectIdColumn() id!: ObjectID;

  @Column() game!: number;

  @Column() chatId!: number;

  @Column() results!: IResult[];

  @Column() top?: IResult;

  @Column() isReady!: boolean;

  constructor(game?: Partial<Game>) {
    Object.assign(this, game);
  }
}
