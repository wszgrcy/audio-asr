import * as esbuild from 'esbuild';
import path from 'path';
// todo 暂时不需要,因为不需要创建文件
export async function main() {
  const isWatch = process.argv.includes('--watch');
  const options: esbuild.SameShape<esbuild.BuildOptions, esbuild.BuildOptions> =
    {
      format: 'esm',
      platform: 'node',
      bundle: true,
      entryPoints: {
        init: './src/init/init.dev.ts',
      },
      outdir: path.join(process.cwd(), 'init-dist'),
      tsconfig: 'tsconfig.json',
      plugins: [],
      conditions: [
        'import',
        'module',
        'node',
        'commonjs',
        'require',
        'default',
      ],
      mainFields: ['fesm2022', 'module', 'main'],

      packages: 'external',
      outExtension: {
        '.js': '.mjs',
      },
      sourcemap: true,
      define: {
        SERVE: `${isWatch}`,
        'process.env.WORK_PLATFORM': `'client'`,
      },
    };
  if (isWatch) {
    const ctx = await esbuild.context(options);
    ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

main();
