import { DirzzleConfigPath } from './const';
import { pool$$ } from './get-db';
import { $ } from 'execa';

export async function init() {
  await pool$$().query(`CREATE SCHEMA IF NOT EXISTS public;`);
  // await pool$$().query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  // await pool$$().query(`CREATE EXTENSION IF NOT EXISTS vector;`);

  const result = await pool$$().query(`select * from pg_extension;`);

  await $({ preferLocal: true, stdio: 'inherit' })(`drizzle-kit`, [
    'push',
    '--config',
    DirzzleConfigPath,
    '--force',
    'true',
  ]);
}
