import { defineConfig } from 'oxfmt'

export default defineConfig({
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    // '**/app/components/ui/**',
    '**/db/drizzle/**',
  ],
  printWidth: 80,
  embeddedLanguageFormatting: 'auto',
  sortImports: {
    groups: [
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
})
