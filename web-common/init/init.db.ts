import path from 'path';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import fs from 'fs';

async function main() {
  const { $ } = await import('execa');

  await $(
    'drizzle-kit',
    [
      'generate',
      '--config',
      path.join(process.cwd(), 'init', './drizzle.config.ts'),
    ],
    { preferLocal: true, stdio: 'inherit', env: { PLATFORM: 'webview' } },
  );

  const migrations = readMigrationFiles({
    migrationsFolder: path.join(process.cwd(), './drizzle-sql'),
  });
  await fs.promises.writeFile(
    path.join(process.cwd(), '../desktop/src', './assets/pglist.init.json'),
    JSON.stringify(migrations),
  );
  await fs.promises.writeFile(
    path.join(process.cwd(), '../mobile/src', './assets/pglist.init.json'),
    JSON.stringify(migrations),
  );
}
main();
