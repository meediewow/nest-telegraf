import { User } from 'telegraf/typings/core/types/typegram';
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

interface IRestriction {
  createdAt: number;
  periodDays: number;
}

@Entity('karmas')
export class Karma {
  @ObjectIdColumn() id!: ObjectID;
  @Column() chatId!: number;
  @Column() userId!: number;
  @Column() telegrafData!: User;
  @Column() value!: number;
  @Column() lastRestrictionUntil?: number;
  @Column() restrictions!: IRestriction[];

  constructor(karma?: Partial<Karma>) {
    Object.assign(this, karma);
  }
}
