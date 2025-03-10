/* eslint-disable @typescript-eslint/no-explicit-any */
import configService from '@stingerloom/core/common/ConfigService';
import { DatabaseClientOptions } from '@stingerloom/core/orm/core/DatabaseClientOptions';
import 'dotenv/config';

const option: DatabaseClientOptions = {
  type: 'mariadb',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  database: configService.get<string>('DB_NAME'),
  password: configService.get<string>('DB_PASSWORD'),
  username: configService.get<string>('DB_USER'),
  entities: [__dirname + '/entity/*.ts', __dirname + '/entity/map/*.ts'],
  synchronize: true,
  logging: true,
};

const databaseOption = option;
export default databaseOption;
