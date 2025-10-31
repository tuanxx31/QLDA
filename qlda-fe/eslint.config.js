import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 🚫 Tắt rule mặc định để dùng plugin tốt hơn
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // 🧹 Xóa import không dùng
      'unused-imports/no-unused-imports': 'error',

      // ⚠️ Cảnh báo biến không dùng (nhưng bỏ qua biến có tiền tố "_")
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ⚙️ Quy tắc khác
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
