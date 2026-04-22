import type { Plugin } from 'esbuild';

const defaultPlugin: Plugin = {
  name: 'raw',
  setup(build) {
    console.log('hello');
  },
};

export default [defaultPlugin];
