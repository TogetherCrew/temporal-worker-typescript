// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  { ignores: ['**/dist/**', '**/node_modules/**', 'commitlint.config.js'] },
);
