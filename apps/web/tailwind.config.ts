import type { Config } from 'tailwindcss';
import dazzlingPreset from '../../packages/config/tailwind/index.js';

const config: Config = {
  presets: [dazzlingPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
