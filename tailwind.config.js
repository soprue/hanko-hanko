import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    extend: {
      screens: {
        wide: '1440px',
        'max-wide': { max: '1439px' },
      },
      fontFamily: {
        pretendard: ['Pretendard'],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        warning: 'var(--warning)',

        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',

        text: {
          DEFAULT: 'var(--text)',
          heading: 'var(--text-foreground)',
          muted: 'var(--text-muted)',
        },
      },
    },
  },
  plugins: [typography],
};
