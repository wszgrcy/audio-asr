import { PgTable } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
export const DbConfig = {
  provider: 'pg' as const,
  client: () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    return pool;
  },
  dialect: 'postgresql' as const,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export type DB_TYPE = {
  table: PgTable;
};
