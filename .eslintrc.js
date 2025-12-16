module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  plugins: ['i18next'],
  rules: {
    'i18next/no-literal-string': [
      'error',
      {
        markupOnly: true,
        ignoreAttribute: [
          'className',
          'style',
          'src',
          'alt',
          'href',
          'target',
          'role',
          'aria-label',
          'data-testid',
          'id',
          'name',
          'value',
          'placeholder',
          'type',
          'dir',
          'variant',
          'color',
          'size',
          'sx',
          'component',
          'key',
          'edge',
          'position',
          'anchor'
        ],
        onlyAttribute: false,
        ignoreCallee: ['console.log', 'console.error', 'console.warn', 'require'],
        ignore: [
          'utf-8',
          'application/json',
          'text/html',
          'http://localhost:3001',
          'http://localhost:3000',
          'rtl',
          'ltr',
          'inherit',
          'default',
          'flex',
          'block',
          'none',
          'error',
          'warning',
          'info',
          'success',
          'primary',
          'secondary',
          'Admin123!',
          'admin@levhedva.org',
          'muirtl',
          'muiltr'
        ]
      }
    ],
    // Note: English-only comments policy is enforced via:
    // 1. Python script: python3 convert-hebrew-to-english.py
    // 2. Pre-commit hook (optional, see docs/ENGLISH-COMMENTS-POLICY.md)
    // 3. Code review process
    'spaced-comment': ['warn', 'always', {
      'markers': ['/'],
      'exceptions': ['-', '+', '*']
    }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'i18next/no-literal-string': 'off'
      }
    },
    {
      files: ['src/setupTests.ts', 'src/i18n/**', 'src/**/theme.ts', 'src/components/RTLThemeProvider.tsx'],
      rules: {
        'i18next/no-literal-string': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};
