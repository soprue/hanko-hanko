import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import generateIconTypesPlugin from './scripts/vite-plugin-generate-icon-types';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    tailwindcss(),
    generateIconTypesPlugin(),
    sentryVitePlugin({
      org: 'gahee-kim',
      project: 'hanko-hanko',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },

  build: {
    sourcemap: true,
  },
});
