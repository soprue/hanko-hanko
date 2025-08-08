import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function generateIconTypesPlugin(): Plugin {
  return {
    name: 'vite-plugin-generate-icon-types',
    apply: 'serve' as const, // dev 모드에서만 실행
    configureServer() {
      const iconsDir = path.resolve(__dirname, '../src/assets/icons');

      // 초기 1회 실행
      runGenerateScript();

      let debounceTimer: NodeJS.Timeout | null = null;

      // 아이콘 디렉토리 watch
      fs.watch(iconsDir, (_, filename) => {
        if (!filename || !filename.endsWith('.svg')) return;

        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          console.log(`🔄 Icons changed: ${filename}`);
          runGenerateScript();
        }, 300); // 0.3초 안에 여러 번 바뀌면 한 번만 실행
      });
    },
  };
}

function runGenerateScript() {
  spawn('npm', ['run', 'generate:icon-types'], { stdio: 'inherit' });
}
