import * as esbuild from 'esbuild';
import path from 'node:path';
import { build, ServerCommonConfig } from '../../script/common.esbuild-config';
// 发布之前构建
async function main() {
  const isProd = process.argv.includes('--prod');
  const ENV = isProd ? 'production' : 'dev';
  const cwd = process.cwd();
  const OUT_DIR = path.join(cwd, './dist');
  const options: esbuild.BuildOptions = {
    ...ServerCommonConfig(),
    treeShaking: true,
    entryPoints: [
      { in: path.join(cwd, './src/main.ts'), out: './main' },
      // prod用
      { in: path.join(cwd, './script/init.prod.ts'), out: './init' },
    ],
    outdir: OUT_DIR,
    tsconfig: path.join(cwd, 'tsconfig.json'),
    define: {
      'process.env.WORK_PLATFORM': `'server'`,
      'process.env.NODE_ENV': `'${ENV}'`,
    },
    packages: isProd ? 'bundle' : 'external',
    inject: [path.join(__dirname, './cjs-shim.ts')],
    minify: isProd,
    sourcemap: !isProd,
    legalComments: 'external',
    alias: {
      '@angular/core': 'static-injector',
    },
  };
  await build(options, async () => {
    console.log('准备运行');

    const { $ } = await import('execa');
    $({ stdio: 'inherit' })(
      `node --env-file=.env.${ENV} --inspect --watch ./dist/main.mjs`,
    );
    // todo 0xC000013A
  });
}

main();
