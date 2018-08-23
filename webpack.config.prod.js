var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    // PredictChart: './src/PredictChart.js',
    // ChartWithVolume: './src/ChartWithVolume.js',
    PredictChartMobile: './src/Predict.js',
    // SampleChart: './src/Sample.js',
    // StockChart: './src/StockChart.js',
    // TimeTrendChart: './src/mobile/TimeTrendChart.js',
    // CandleStickChart: './src/CandleStickCharts/CandleStickChart.js',
    KlineBuySellChart: './src/KlineBuySellChart.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    // filename: '[name].[chunkhash].js',
    filename: '[name].js',
    library: '[name]'
  },
  externals: {
    d3: 'd3'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url-loader'
      }
    ]
  }
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin({
  //     names: ['d3'],
  //     minChunks: 3
  //   }),
  //   new webpack.optimize.UglifyJsPlugin({
  //     // Eliminate comments
  //     comments: false,

  //     // Compression specific options
  //     compress: {
  //       // remove warnings
  //       warnings: false,

  //       // Drop console statements
  //       drop_console: true
  //     }
  //   })
  // ]
};
