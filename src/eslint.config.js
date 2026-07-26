import tsParser from '@typescript-eslint/parser';
import requireFirefoxFlagForSessions from './eslint-rules/require-firefox-flag-for-sessions.js';

export default [
  {
    files: ['**/*.ts', '**/*.js', '**/*.mts'],
    ignores: ['.output/**', '.wxt/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      custom: {
        rules: {
          'require-firefox-flag-for-sessions': requireFirefoxFlagForSessions,
        },
      },
    },
    rules: {
      'custom/require-firefox-flag-for-sessions': 'error',
    },
  },
];
