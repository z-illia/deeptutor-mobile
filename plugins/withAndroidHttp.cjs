const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

// DeepTutor supports user-selected HTTP servers, including local-network hosts.
// Apply this to the main manifest so release builds have the same HTTP support
// as debug builds, and keep it reproducible when Expo regenerates android/.
module.exports = function withAndroidHttp(config) {
  return withAndroidManifest(config, config => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    application.$['android:usesCleartextTraffic'] = 'true';
    return config;
  });
};
