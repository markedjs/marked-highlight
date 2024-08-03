import markedEslintConfig from '@markedjs/eslint-config';
import globals from 'globals';

export default [
  {
    ignores: ['**/lib'],
  },
  ...markedEslintConfig,
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
