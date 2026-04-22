import { drizzle } from 'drizzle-orm/node-postgres';
import { DbConfig } from '../../config';

export const db = drizzle({
  client: DbConfig.client(),
  logger: process.env.NODE_ENV === 'dev',
});
