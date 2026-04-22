import globals from 'globals';

import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

export default [
  globalIgnores([
    '**/*.mjs',
    '**/*.js',
    '**/*.d.ts',
    'src/environments/*',
    'e2e/playwright.config.ts',
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['*.ts'],
    parserOptions: {
      project: [
        './tsconfig.serve.json',
        './src/tsconfig.app.json',
        './src/tsconfig.spec.json',
        './e2e/tsconfig.e2e.json',
      ],
      createDefaultProgram: true,
    },

    rules: {
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      'prefer-arrow/prefer-arrow-functions': 0,
      '@angular-eslint/directive-selector': 0,
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'jsdoc/newline-after-description': 0,
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-private-class-members': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-useless-catch': 'off',
      'no-constant-condition': 'off',
      'no-empty': 'off',
      'no-empty-pattern': 'off',
      'no-unsafe-finally': 'off',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unexpected-multiline': 'off',
    },
  },
];
