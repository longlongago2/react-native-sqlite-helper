module.exports = {
  presets: [
    'module:metro-react-native-babel-preset', // transform react-native code
    ['@babel/preset-env', { targets: { node: 'current' } }], // Configure Babel to target your current version of Node
  ],
  sourceMaps: true,
};
