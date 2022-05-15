export enum KarmaActionsEnum {
  ON = 'on',
  OFF = 'off',
  MY = 'my',
  TOP = 'top',
}

export interface IDelayBuffer {
  id: string;
  targetId: number;
  timer: NodeJS.Timeout;
}
