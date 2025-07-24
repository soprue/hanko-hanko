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
      fontFamily: {
        pretendard: ['Pretendard'],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        warning: 'var(--warning)',

        bg: 'var(--background)',
        fg: 'var(--foreground)',
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
