import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import { Telegraf } from 'telegraf';
import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
  TelegrafOptionsFactory,
} from './interfaces/telegraf-options.interface';
import { telegrafStageProvider } from './stage.provider';
import {
  TELEGRAF_BOT_NAME,
  TELEGRAF_MODULE_OPTIONS,
} from './telegraf.constants';
import { createBotFactory } from './utils/create-bot-factory.util';
import { getBotToken } from './utils/get-bot-token.util';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [],
})
export class TelegrafCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(TELEGRAF_BOT_NAME)
    private readonly botName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  public static forRoot(options: TelegrafModuleOptions): DynamicModule {
    const telegrafBotName = getBotToken(options.botName);

    const telegrafBotNameProvider = {
      provide: TELEGRAF_BOT_NAME,
      useValue: telegrafBotName,
    };

    const telegrafBotProvider: Provider = {
      provide: telegrafBotName,
      useFactory: async () => createBotFactory(options),
    };

    return {
      module: TelegrafCoreModule,
      providers: [
        {
          provide: TELEGRAF_MODULE_OPTIONS,
          useValue: options,
        },
        telegrafStageProvider,
        telegrafBotNameProvider,
        telegrafBotProvider,
      ],
      exports: [
        telegrafStageProvider,
        telegrafBotNameProvider,
        telegrafBotProvider,
      ],
    };
  }

  public static forRootAsync(
    options: TelegrafModuleAsyncOptions,
  ): DynamicModule {
    const telegrafBotName = getBotToken(options.botName);

    const telegrafBotNameProvider = {
      provide: TELEGRAF_BOT_NAME,
      useValue: telegrafBotName,
    };

    const telegrafBotProvider: Provider = {
      provide: telegrafBotName,
      useFactory: async (factoryOptions: TelegrafModuleOptions) =>
        createBotFactory(factoryOptions),
      inject: [TELEGRAF_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TelegrafCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        telegrafStageProvider,
        telegrafBotNameProvider,
        telegrafBotProvider,
      ],
      exports: [
        telegrafStageProvider,
        telegrafBotNameProvider,
        telegrafBotProvider,
      ],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    const bot = this.moduleRef.get<Telegraf>(this.botName);
    if (bot) {
      await bot.stop();
    }
  }

  private static createAsyncProviders(
    options: TelegrafModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TelegrafOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: TelegrafModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TELEGRAF_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass || options.useExisting) as Type<TelegrafOptionsFactory>,
    ];
    return {
      provide: TELEGRAF_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TelegrafOptionsFactory) =>
        optionsFactory.createTelegrafOptions(),
      inject,
    };
  }
}
