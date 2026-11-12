// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    // The audit is reference material, including a separate Next.js checkout.
    ignores: ['dist/**', '.expo/**'],
  },
  expoConfig,
]);
