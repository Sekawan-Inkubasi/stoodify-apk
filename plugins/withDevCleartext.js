const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDevCleartext(config, { enabled = false } = {}) {
  return withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (!application) return modConfig;
    if (enabled) application.$['android:usesCleartextTraffic'] = 'true';
    else delete application.$['android:usesCleartextTraffic'];
    return modConfig;
  });
};
