import { baseConfig } from './index.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export const nextConfig = [
  ...baseConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];

export default nextConfig;
