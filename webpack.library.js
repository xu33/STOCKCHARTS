var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    PredictChartMobile: './src/Predict.js'
    // Timechart: './src/timecharts/Timechart.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
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
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      // Eliminate comments
      comments: false,

      // Compression specific options
      compress: {
        // remove warnings
        warnings: false,

        // Drop console statements
        drop_console: true
      }
    })
  ]
};
