var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    LineChart: './src/line.js'
  },
  output: {
    path: path.join(__dirname, 'liyang'),
    filename: '[name].js',
    chunkFileName: '[name].js',
    libraryTarget: 'umd',
    library: '[name]'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  },
  externals: {
    'd3': 'd3'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'liyang/template.html',
      inject: 'head'
    })
  ]
};