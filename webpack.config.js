const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/client.js',
  output: {
    path: path.resolve(__dirname, 'client'),
    filename: 'client-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'raw-loader'
        }
      }
    ]
  },
  devtool: 'cheap-module-source-map'
};