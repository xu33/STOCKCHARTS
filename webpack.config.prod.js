var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: {
    PredictChart: './src/predict.js',
    ChartWithVolume: './src/ChartWithVolume.js',
  },
  externals: {
      // 'd3-scale': 'window.d3',
      jquery: 'window.$',
      raphael: 'window.Raphael'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: '[name]'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};