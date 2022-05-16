export interface ICaptchaPayload {
  answer: string;
  triesLeft: number;
  userId: number;
  chatId: number;
  banTimer: NodeJS.Timeout;
  enterMessageIds: number[];
}

export interface ICallbackData {
  answer: string;
  userId: number;
}
