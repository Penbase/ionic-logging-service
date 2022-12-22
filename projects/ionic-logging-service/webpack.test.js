const webpack = require('webpack');
console.log('Load custom webpack config')

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  node: {
  },
  optimization: {
    minimize: false
  },
  resolve: {
    fallback: {
      "util": require.resolve("util/")
    }
  }
};