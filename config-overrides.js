const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Custom console clearing plugin
class ClearConsolePlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tap('ClearConsolePlugin', () => {
      console.clear();
    });
  }
}

module.exports = function override(config, env) {
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
  };

  // Add plugins
  config.plugins = [
    new ClearConsolePlugin(), // Add the console clearing plugin
    ...config.plugins.filter(plugin => !(plugin instanceof HtmlWebpackPlugin)),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return config;
}; 