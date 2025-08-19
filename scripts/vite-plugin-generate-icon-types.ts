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
  // spawn('npm', ['run', 'generate:icon-types'], { stdio: 'inherit' });

  // npm 대신 npx ts-node 직접 실행
  const scriptPath = path.resolve(__dirname, './generate-icon-types.ts');

  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['ts-node', scriptPath];

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true, // Windows에서 인자 파싱 문제 방지
  });

  child.on('error', (err) => {
    console.error('❌ Failed to run generate-icon-types script:', err);
  });
}
