import { defineConfig } from 'drizzle-kit';
import path from 'path';
import normalizePath from 'normalize-path';
import { connectionString } from './const';
//server\test\util\schema

export default defineConfig({
  out: './drizzle',
  schema: [
    normalizePath(path.resolve(process.cwd(), './test/util/schema') + '/*'),
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  //   schemaFilter: ['test'],
  verbose: true,
  tablesFilter: ['!vchordrq_sampled_queries'],
});
