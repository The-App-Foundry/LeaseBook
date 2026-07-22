// Convert a legacy config to flat config for compatibility
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const legacy = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: ['./tsconfig.json', './.storybook/tsconfig.json'],
  },
  ignorePatterns: ['dist/**', 'src-tauri/**', 'graphify-out/**', 'eslint.config.cjs'],
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['storybook', 'react', '@typescript-eslint'],
  extends: [
    'plugin:storybook/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    react: { version: 'detect', jsxRuntime: 'automatic' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
module.exports = [...compat.config(legacy)];
