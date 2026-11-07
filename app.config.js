const withDevCleartext = require('./plugins/withDevCleartext');

module.exports = ({ config }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.BASE_API_URL || '';
  const enabled = apiUrl.startsWith('http://');
  return {
    ...config,
    plugins: [...(config.plugins || []), '@react-native-community/datetimepicker', 'expo-splash-screen', ['./plugins/withDevCleartext', { enabled }]],
  };
};
