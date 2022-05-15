import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

interface IKarma {
  isEnabled: boolean;
  isRestrictionsEnabled: boolean;
  initKarma: number;
}

@Entity('chats')
export class Chat {
  @ObjectIdColumn() id!: ObjectID;
  @Column() chatId!: number;
  @Column() karma!: IKarma;

  constructor(chat?: Partial<Chat>) {
    Object.assign(this, chat);
  }
}
