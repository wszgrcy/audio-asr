import { spawnSync } from 'child_process';
import { isNumber } from 'es-toolkit/compat';
import * as esbuild from 'esbuild';
import { ResultPromise } from 'execa';

export function afterBuild(): esbuild.Plugin {
  return {
    name: 'after-build',
    setup: async (build) => {
      const isWatch = process.argv.includes('--watch');

      const { $ } = await import('execa');
      let ref:
        | ResultPromise<{
            stdio: 'inherit';
            reject: false;
          }>
        | undefined;
      function startupFn() {
        ref = $({
          stdio: 'inherit',
          reject: false,
          shell: false,
          windowsHide: false,
        })`electron . --serve`;
      }
      build.onEnd(() => {
        if (!isWatch) {
          return;
        }
        if (ref) {
          ref.finally(() => {
            startupFn();
          });
          if (process.platform === 'win32') {
            if (isNumber(ref?.pid)) {
              spawnSync('taskkill', ['/pid', `${ref.pid}`, '/T', '/F']);
            }
          }
          ref.kill();
        } else {
          startupFn();
        }
      });
    },
  };
}
