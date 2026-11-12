const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDevCleartext(config) {
  return withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (!application) return modConfig;
    application.$['android:usesCleartextTraffic'] = 'true';
    return modConfig;
  });
};
