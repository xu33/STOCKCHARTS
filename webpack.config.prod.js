var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    PredictChart: './src/PredictChart.js',
    ChartWithVolume: './src/ChartWithVolume.js',
  },
  externals: {
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
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      },
      include: path.join(__dirname, 'src')
    }]
  },
  plugins: [
    
  ]
};