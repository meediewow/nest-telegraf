import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORMConfig } from './mongodb.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...ORMConfig,
        url: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoDBModule {}
