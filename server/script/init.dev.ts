import { initSet } from './init';
// 开发时生成同时初始化
export async function main() {
  const { $ } = await import('execa');
  await $(
    'auth',
    [
      'generate',
      '--config',
      './script/auth/auth.ts',
      '--output',
      '../define/src/schema/auth.ts',
      '--yes',
    ],
    { preferLocal: true, stdio: 'inherit' },
  );
  await $(
    'drizzle-kit',
    ['generate', '--config', './script/auth/drizzle.config.ts'],
    { preferLocal: true, stdio: 'inherit' },
  );

  initSet();
}
main();
