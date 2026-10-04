import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
      // Design tokens live in src/styles/tokens.css only: no hard-coded hex colours elsewhere.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message: 'Use a design token (src/styles/tokens.css) instead of a hex colour.',
        },
        {
          selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]',
          message: 'Use a design token (src/styles/tokens.css) instead of a hex colour.',
        },
      ],
    },
  },
  {
    // Metadata/theme-color and server config legitimately carry the brand canvas colour once.
    files: ['src/app/(site)/layout.tsx', 'next.config.ts', 'tests/**', 'scripts/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'migrations/',
      'src/payload-types.ts',
      'src/app/(payload)/**',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
