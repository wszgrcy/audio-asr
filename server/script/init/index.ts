import { user } from '@project/define';
import { eq } from 'drizzle-orm';
import { db } from '../auth/db';
import { DbConfig } from '@config';
import * as fs from 'fs';
import * as path from 'path';
import { auth } from '../auth/auth';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
/** 运行时初始化 */
export async function initSet() {
  const status = path.join(process.cwd(), '.status');
  const initedPath = path.join(status, '.inited');
  const client = DbConfig.client();
  await client.end();

  await fs.promises.mkdir(status, { recursive: true });
  if (fs.existsSync(initedPath)) {
    console.log(`存在 ${initedPath} 跳过初始化`);
    return;
  }
  await migrate(db, { migrationsFolder: './drizzle-sql' });

  const result0 = await auth.api.signUpEmail({
    body: {
      name: 'admin',
      email: 'admin@admin.com',
      password: process.env.ADMIN_PASSWORD,
    },
  });

  await db
    .update(user)
    .set({ role: 'admin' })
    .where(eq(user.id, result0.user.id));
  const result2 = await auth.api.signInEmail({
    body: {
      email: 'admin@admin.com',
      password: process.env.ADMIN_PASSWORD,
    },
    returnHeaders: true,
  });
  const headers = [
    ['cookie', result2.headers.get('set-cookie')!] as [string, string],
  ];
  const result = await auth.api.listUsers({
    query: {
      searchValue: 'admin',
      searchField: 'name',
      limit: 0,
    },
    headers: headers,
  });
  if (result.total === 1) {
    console.log('用户创建成功');
  } else {
    throw new Error('admin list error');
  }
  const result3 = await auth.api.createOrganization({
    body: { name: 'default', slug: 'default' },
    headers,
  });

  const result4 = await auth.api.listMembers({
    query: { organizationSlug: 'default' },
    headers,
  });
  if (result4.total === 1) {
    console.log('组织创建成功');
  }
  await fs.promises.writeFile(initedPath, '');
}
