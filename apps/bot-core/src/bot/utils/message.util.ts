import { noop } from 'lodash';
import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { Logger } from '@nestjs/common';

const DELETE_MESSAGE_DELAY = 60; // sec

export const removeMessageTimeout = async (
  ctx: Context,
  msg: Message.TextMessage,
  delaySec = DELETE_MESSAGE_DELAY,
) => {
  setTimeout(async () => {
    try {
      await ctx.deleteMessage(msg.message_id);
      /*
        If the command is deleted with the first message from the bot,
        there is a possibility of an exception: message not found. 
      */
      await ctx.deleteMessage(ctx.message?.message_id).catch(noop);
    } catch (error: unknown) {
      Logger.error((error as Error).message);
    }
  }, delaySec * 1000);
  return msg;
};
