const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [...require('metro-config/src/defaults/defaults').assetExts, 'pem', 'p12']
    }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
