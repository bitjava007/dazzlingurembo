import js from '@eslint/js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export const baseConfig = [
  js.configs.recommended,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.turbo/**'],
  },
];

export default baseConfig;
