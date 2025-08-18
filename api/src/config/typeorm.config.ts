import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Load environment variables from .env file
config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.getOrThrow('DATABASE_URL'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  ssl:
    configService.get('DB_SSL') === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
