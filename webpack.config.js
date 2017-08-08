var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  devtool: 'inline-source-map',
  entry: {
    test: './src/test.js',
    index: './src/index.js',
    d3example: './src/d3example.js',
    line: './src/line.js',
    st: './src/st.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    sourceMapFilename: '[file].map',
    filename: '[name].js',
    chunkFileName: '[id].[chunkhash].js',
    // You can use publicPath to point to
    // the location where you want webpack-dev-server
    // to serve its "virtual" files
    publicPath: '/static/'
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
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new HtmlWebpackPlugin({
      filename: "[name].html"
    })
  ]
};