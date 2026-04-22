import path from 'path';
import { initSet } from './init-set';
// 开发时生成同时初始化
async function main() {
  const { $ } = await import('execa');

  await $(
    'drizzle-kit',
    [
      'generate',
      '--config',
      path.join(process.cwd(), 'src/init', './drizzle.config.ts'),
    ],
    { preferLocal: true, stdio: 'inherit', env: { PLATFORM: 'webview' } },
  );

  initSet();
}
main();
