var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-cheap-source-map',
  entry: {
    index: './src/index.js',
    d3example: './src/d3example.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    sourceMapFilename: '[file].map',
    filename: '[name].js',
    publicPath: '/static/'
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
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      // 像loaders一样匹配文件
      test: /\.js$/,

      // 如果文件名设置了，输出这个文件
      // 参考 `sourceMapFileName`
      filename: '[file].map',

      // This line is appended to the original asset processed. For
      // instance '[url]' would get replaced with an url to the
      // sourcemap.
      append: false,
      module: false, // If false, separate sourcemaps aren't generated.
      columns: false, // If false, column mappings are ignored.

      // Use simpler line to line mappings for the matched modules.
      lineToLine: false
    })
  ]
};