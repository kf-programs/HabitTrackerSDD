import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f8f6f1',
        ink: '#262626',
        sage: '#dce7dd',
        blush: '#f3d8d2',
        mist: '#dde7f1',
        butter: '#f6edc8',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(38, 38, 38, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
