import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'lib/generated/**',
    'playwright-report/**',
    'test-results/**',
    // Design mockups — reference material, not application source
    'refs/**',
  ]),
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      // Pre-existing issues surfaced by the eslint-config-next 15 -> 16 upgrade
      // (react-hooks v6 introduced set-state-in-effect/purity/refs as errors).
      // Downgraded to warnings — fixing them requires component refactors,
      // which are tracked separately. Do not silence; burn these down over time.
      // `refs` also misfires on render-time IIFEs that read no refs (verified),
      // so it stays a warning alongside its v6 siblings.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'react/no-unescaped-entities': 'warn',
      'prefer-const': 'warn',
    },
  },
]);

export default eslintConfig;
