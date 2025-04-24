const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'css', 'scss', 'sass'];

module.exports = config;