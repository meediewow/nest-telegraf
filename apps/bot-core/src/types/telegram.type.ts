import { User } from 'telegraf/typings/core/types/typegram';

export type IUser = Omit<User, 'is_bot' | 'username' | 'language_code'>;
