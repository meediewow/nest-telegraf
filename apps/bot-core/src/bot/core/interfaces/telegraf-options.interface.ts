import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { Middleware, Telegraf } from 'telegraf';

export interface TelegrafModuleOptions {
  token: string;
  botName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Partial<Telegraf.Options<any>>;
  launchOptions?: Telegraf.LaunchOptions | false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  include?: Array<() => any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares?: ReadonlyArray<Middleware<any>>;
}

export interface TelegrafOptionsFactory {
  createTelegrafOptions():
    | Promise<TelegrafModuleOptions>
    | TelegrafModuleOptions;
}

export interface TelegrafModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  botName?: string;
  useExisting?: Type<TelegrafOptionsFactory>;
  useClass?: Type<TelegrafOptionsFactory>;
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<TelegrafModuleOptions> | TelegrafModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}
