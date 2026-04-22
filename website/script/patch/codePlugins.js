/**
 * @type {import('esbuild').Plugin}
 */
const defaultPlugin = {
  name: 'defaultPlugin',
  setup(build) {
    console.log('hello');
  },
};
module.exports = [defaultPlugin];

// +    const path1 = require('path')
// +    const filePath=path1.join(context.workspaceRoot, 'script/patch/codePlugins.js')
// +    console.log('codePlugins filePath:',filePath)
// +    const codePlugins = require(filePath)
// +    extensions = { codePlugins: codePlugins }

// resolveExtensions =
// ['.ts', '.tsx', '.mjs', '.js', '.cjs']
