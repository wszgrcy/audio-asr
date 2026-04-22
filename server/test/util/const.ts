import normalizePath from 'normalize-path';
import path from 'path';
export const DirzzleConfigPath = normalizePath(
  path.join(process.cwd(), './test/util', 'test.config.ts'),
);
export const connectionString = `postgres://postgres:postgres12345678@127.0.0.1:5433/postgres?sslmode=disable`;
