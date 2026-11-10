const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const { createLoader } = require('./helpers/rich-markdown.cjs');

test('Expo generates HTTP support in the main Android manifest for release and preserves INTERNET permission', () => {
  const config = JSON.parse(execFileSync(process.execPath, ['node_modules/expo/bin/cli', 'config', '--type', 'introspect', '--json'], { encoding: 'utf8' }));
  const manifest = config._internal.modResults.android.manifest.manifest;
  assert.equal(manifest.application[0].$['android:usesCleartextTraffic'], 'true');
  assert.ok(manifest['uses-permission'].some(permission => permission.$['android:name'] === 'android.permission.INTERNET'));
  assert.equal(manifest.application[0].$['android:networkSecurityConfig'], undefined);
});

test('APK and store build profiles resolve the same API origin and auth endpoint as local development', () => {
  const config = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  const original = process.env.EXPO_PUBLIC_API_URL;
  try {
    for (const profile of ['preview', 'production']) {
      process.env.EXPO_PUBLIC_API_URL = config.build[profile].env.EXPO_PUBLIC_API_URL;
      const load = createLoader({ '@react-native-async-storage/async-storage': {} });
      const { defaultServerUrl, normalizeServerUrl } = load('src/api/server.ts');
      const { api } = load('src/api/client.ts');
      assert.equal(defaultServerUrl, 'http://deeptutor.local');
      assert.equal(api.getUri({ url: '/auth/status' }), 'http://deeptutor.local/api/auth/status');
      assert.equal(normalizeServerUrl('http://deeptutor.local/api/'), defaultServerUrl);
    }
  } finally {
    if (original === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = original;
  }
});
