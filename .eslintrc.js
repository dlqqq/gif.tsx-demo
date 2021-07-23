// ESLint thinks that 'module' is not defined.
// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['react', 'prettier', '@typescript-eslint', 'jsx-a11y'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    // not needed with typescript
    'react/prop-types': 'off',
    // false positives with memoized arrow functions; see
    // https://github.com/yannickcr/eslint-plugin-react/issues/2105
    'react/display-name': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
