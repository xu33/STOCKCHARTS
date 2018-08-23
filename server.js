var path = require('path');
var webpack = require('webpack');
// var webpack = 'commonjs webpack'
var express = require('express');
var config = require('./webpack.config');
var app = express();
var compiler = webpack(config);

app.use(express.static('dist'));

app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
  })
);

// app.use(require('webpack-hot-middleware')(compiler));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'example/index.html'));
});

app.get('/example', function(req, res) {
  res.sendFile(path.join(__dirname, 'example/example.html'));
});

app.get('/d3', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/d3.html'));
});

app.get('/st', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/st.html'));
});

app.get('/brushexample', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/zoombrush_old.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/test.html'));
});

app.get('/huice', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/huice.html'));
});

app.get('/image', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/image.html'));
});

app.get('/canvas', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/canvas.html'));
});

app.listen(3003, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log('Listening at http://localhost:3003/');
});
