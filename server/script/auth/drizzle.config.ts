import { defineConfig } from 'drizzle-kit';
import path from 'path';
import normalizePath from 'normalize-path';
import { DbConfig } from '../../config';
export default defineConfig({
  out: './drizzle-sql',
  schema: [
    normalizePath(
      path.resolve(
        process.cwd(),
        'node_modules/@project/define/dist/schema.mjs',
      ),
    ),
  ],
  dialect: DbConfig.dialect,
  dbCredentials: {
    url: DbConfig.dbCredentials.url,
  },
  tablesFilter: ['!vchordrq_sampled_queries'],
  verbose: true,
});
