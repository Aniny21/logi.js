const path = require('path');

const PROD = process.env.NODE_ENV.replace(/\s+/g, '') === 'production';

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: PROD ? 'logi.min.js' : 'logi.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'logi',
    libraryTarget: 'var'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  optimization: {
    minimize: PROD
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}
