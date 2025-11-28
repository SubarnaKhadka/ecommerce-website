import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    files: ['services/**/src/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
    ignores: ['node_modules', 'dist', 'src/shared/dist/'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.base.json', './services/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },

    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_|next',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^err',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
