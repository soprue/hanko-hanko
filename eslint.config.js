import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: [
          './tsconfig.json',
          './tsconfig.app.json',
          './tsconfig.node.json',
        ],
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전 자동 감지
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: true,
        alias: {
          map: [['/', './']],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+ 부터 JSX에서 import 안 해도 되므로 끔
      'react/prop-types': 'off', // TS 쓰면 prop-types 필요 없으므로 끔
      '@typescript-eslint/no-unused-vars': ['warn'], // TS용 미사용 변수 경고
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // 내장 모듈 (fs, path)
            'external', // 외부 라이브러리 (react, axios 등)
            'internal', // src/ 내부 경로 alias
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'warn',
      'import/newline-after-import': 'warn',
    },
    ignores: ['eslint.config.js'],
  },
  eslintConfigPrettier,
]);
