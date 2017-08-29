var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    LineChart: './src/line.js'
  },
  output: {
    publicPath: 'assets/',
    path: path.join(__dirname, 'liyang'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: '[name]'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 20000, // 20KB
          name: '[path][name].[ext]',
          // publicPath: `${LOCAL_HOST}/assets/`
          publicPath: `/assets/`
        }
      }
    ]
  },
  externals: {
    'd3': 'd3'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'liyang/template.html',
      filename: '[name].html',
      inject: 'head'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'liyang'),
    compress: false,
    port: 9000
  }
};