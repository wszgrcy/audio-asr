import { defineConfig } from 'drizzle-kit';
import path from 'path';
import normalizePath from 'normalize-path';
export default defineConfig({
  out: './drizzle-sql',
  schema: [normalizePath(path.resolve(process.cwd(), 'entity/index.ts'))],
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url: '',
  },
  verbose: true,
});
