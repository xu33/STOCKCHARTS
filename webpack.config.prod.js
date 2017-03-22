var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    PredictChart: './src/PredictChart.js',
    ChartWithVolume: './src/ChartWithVolume.js',
    PredictChartMobile: './src/Predict.js',
    SampleChart: './src/Sample.js',
    StockChart: './src/StockChart.js',
    TimeTrendChart: './src/mobile/TimeTrendChart.js',
    CandleStickChart: './src/mobile/CandleStickChart'
  },
  externals: {
    jquery: 'window.$',
    raphael: 'window.Raphael',
    d3: 'window.d3'
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
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  }
};