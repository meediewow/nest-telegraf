import { IUser } from 'src/types/telegram.type';

export const getUserMention = (user: IUser | undefined) => {
  return `[${user?.first_name} ${user?.last_name || ''}](tg://user?id=${
    user?.id || 2
  })`;
};
