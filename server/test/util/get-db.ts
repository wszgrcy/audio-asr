import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { connectionString } from './const';
import { computed } from 'static-injector';
export const pool$$ = computed(() => {
  return new Pool({
    connectionString: connectionString,
  });
});

export function getDb() {
  const db = drizzle({ client: pool$$() });
  return db;
}
