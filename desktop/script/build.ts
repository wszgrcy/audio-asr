import * as esbuild from 'esbuild';
import { afterBuild } from './plugin/after-build';
import { getAppSourceCodeDir } from '../app/dir';
import { copy } from 'esbuild-plugin-copy';
import path from 'path';
import normalizePath from 'normalize-path';
import { version } from '../../package.json';
import fs from 'fs';
export async function main() {
  const workspaceDir = getAppSourceCodeDir();

  const isWatch = process.argv.includes('--watch');
  const isProd = process.argv.includes('--prod');
  let dev = isProd ? 'production' : 'dev';
  const options: esbuild.SameShape<esbuild.BuildOptions, esbuild.BuildOptions> =
    {
      absWorkingDir: workspaceDir,
      format: 'esm',
      platform: 'node',
      bundle: true,
      entryPoints: {
        main: './main.ts',
        preload: './preload/index.ts',
      },
      outdir: path.join(process.cwd(), 'dist'),
      // keepNames: true,
      // minify: true,
      // splitting: true,
      tsconfig: 'tsconfig.json',
      plugins: [
        afterBuild(),
        copy({
          assets: [
            {
              from: normalizePath(path.join(workspaceDir, './assets/*')),
              to: '.',
            },
          ],
          verbose: true,
          globbyOptions: {},
        }),
      ],
      conditions: [
        'import',
        'module',
        'node',
        'commonjs',
        'require',
        'default',
      ],
      mainFields: ['fesm2022', 'module', 'main'],
      external: ['electron', '@reflink/reflink'],
      outExtension: {
        '.js': '.mjs',
      },
      banner: {
        js: [
          `import { createRequire as ɵcreateRequire } from 'node:module';`,
          `import ɵpath from 'node:path';`,
          `import ɵurl from 'node:url';`,
          `const ɵrequire = ɵcreateRequire(import.meta.url);`,
          `globalThis.require = ɵrequire;`,
          `globalThis.__filename = ɵurl.fileURLToPath(import.meta.url);`,
          `globalThis.__dirname = ɵpath.dirname(__filename);`,
        ].join('\n'),
      },
      define: {
        SERVE: `${isWatch}`,
        'process.env.WORK_PLATFORM': `'client'`,
        'process.platform': `'${process.platform}'`,
        'process.env.NODE_ENV': `'${dev}'`,
      },
      alias: {
        '@angular/core': 'static-injector',
      },
      minify: isProd,
      legalComments: 'external',
    };
  if (isWatch) {
    const ctx = await esbuild.context(options);
    ctx.watch();
  } else {
    await esbuild.build(options);
    const { $ } = await import('execa');
    console.log('准备安装依赖');
    // version 写入
    const distPackageJsonPath = 'dist/package.json';
    const distPackageJson = JSON.parse(
      fs.readFileSync(distPackageJsonPath, 'utf-8'),
    );
    distPackageJson.version = version;
    fs.writeFileSync(
      distPackageJsonPath,
      JSON.stringify(distPackageJson, null, 2),
    );
    await $({ cwd: 'dist' })`npm install --production`;
  }
}

main();
