import * as esbuild from 'esbuild';
import * as path from 'path';
import { sync } from 'fast-glob';

async function main() {
  const options: esbuild.BuildOptions = {
    platform: 'node',
    sourcemap: 'linked',
    bundle: true,
    entryPoints: sync('./test/**/*.spec.ts', {}).map((item) => {
      return {
        in: `${item}`,
        out: item.slice(0, -3),
      };
    }),
    splitting: false,
    outdir: path.join(process.cwd(), './test-dist'),
    outExtension: {
      '.js': '.mjs',
    },
    format: 'esm',
    // minify: true,
    tsconfig: './test/tsconfig.json',
    charset: 'utf8',
    packages: 'external',
    inject: [path.join(__dirname, './cjs-shim.ts')],
  };
  await esbuild.build(options);
}
main();
