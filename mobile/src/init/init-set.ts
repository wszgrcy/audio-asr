import { readMigrationFiles } from 'drizzle-orm/migrator';
import path from 'path';
import fs from 'fs';
/** 启动时使用 */
export async function initSet() {
  const migrations = readMigrationFiles({
    migrationsFolder: path.join(process.cwd(), './drizzle-sql'),
  });
  await fs.promises.writeFile(
    path.join(process.cwd(), './src/assets/pglist.init.json'),
    JSON.stringify(migrations),
  );
}
