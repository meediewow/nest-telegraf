import { User } from 'telegraf/typings/core/types/typegram';

export const getUserMention = (user: User | undefined) => {
  return `[${user?.first_name} ${user?.last_name || ''}](tg://user?id=${
    user?.id || 2
  })`;
};
