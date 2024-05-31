export default [
  {
    files: ['**/*.js'],
    plugins: {
      jsdoc: jsdoc,
    },
    rules: {
      'jsdoc/require-description': 'error',
      'jsdoc/check-values': 'error',
    },
    ignores: ['build/*', 'dist/*', 'public/*', '**/out/*', '**/node_modules/*'],
  },
];
