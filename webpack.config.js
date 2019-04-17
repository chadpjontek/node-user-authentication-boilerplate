
/**
 * The path module provides utilities for working with file and directory paths
 */
const path = require('path');

/**
 * A webpack plugin to remove/clean your build folder(s) before building
 */
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Ignores node_modules when bundling
 */
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    server: './src/server.js',
  },
  output: {
    filename: './[name].bundle.js',
    chunkFilename: './[name].bundle.js',
    path: path.resolve(__dirname, 'dist') // eslint-disable-line no-undef
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /dist/
        ],
        use: 'eslint-loader',
      },
    ]
  }
};