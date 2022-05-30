import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ORMConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  ssl: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  migrations: [`${__dirname}/**/*.migration{.ts,.js}`],
};
