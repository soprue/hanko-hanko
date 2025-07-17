import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: true,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // React 17+ 부터 JSX에서 import 안 해도 되므로 끔
      "react/prop-types": "off", // TS 쓰면 prop-types 필요 없으므로 끔
      "@typescript-eslint/no-unused-vars": ["warn"], // TS용 미사용 변수 경고
    },
    settings: {
      react: {
        version: "detect", // 설치된 React 버전 자동 감지
      },
    },
  },
  eslintConfigPrettier,
]);
