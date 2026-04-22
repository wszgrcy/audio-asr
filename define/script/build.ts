import * as esbuild from 'esbuild';
import { build, ServerCommonConfig } from '../../script/common.esbuild-config';

// 发布之前构建
async function main() {
  const options: esbuild.BuildOptions = {
    ...ServerCommonConfig(),
    minify: false,
    sourcemap: true,
    packages: 'external',
    entryPoints: [
      {
        in: 'index.ts',
        out: 'index',
      },
      {
        in: './src/index.schema.ts',
        out: 'schema',
      },
      {
        in: './src/auth/index.ts',
        out: 'auth',
      },
      {
        in: './web.index.ts',
        out: 'web',
      },
    ],
  };
  await build(options);
}
main();
