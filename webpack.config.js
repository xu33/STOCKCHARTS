var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/static/',
    host: '192.168.6.1',
    port: '8080'
  },
  entry: {
    // test: './src/test.js',
    // index: './src/index.js',
    // canvas: './src/canvas.js',
    // d3example: './src/d3example.js',
    // line: './src/line.js',
    st: './src/st.js',
    canvasversion: './src/canvasversion.js'
    // h5: './src/h5/chart.js'
    // img: './src/img.js'
  },
  externals: {
    // d3: 'd3'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    sourceMapFilename: '[file].map',
    filename: '[name].js',
    // chunkFileName: '[id].[chunkhash].js',
    // You can use publicPath to point to
    // the location where you want webpack-dev-server
    // to serve its "virtual" files
    publicPath: '/static/'
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
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](.*).js$/,
          chunks: 'all',
          name: 'vendor'
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  }
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'common',
  //     minChunks: function(module, count) {
  //       let context = module.context;
  //       return context && context.indexOf('node_modules') >= 0;
  //     }
  //   }),
  //   new HtmlWebpackPlugin({
  //     filename: '[name].html'
  //   })
  // ]
};
