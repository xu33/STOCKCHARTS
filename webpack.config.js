var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.js',
    predict: './src/Predict.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/static/',
    library: '[name]'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      },
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  }
};