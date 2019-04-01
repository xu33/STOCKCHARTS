var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.config');
var app = express();
var compiler = webpack(config);
var fs = require('fs');
var fetch = require('node-fetch');

app.use(express.static('dist'));

// app.use(
//   require('webpack-dev-middleware')(compiler, {
//     publicPath: config.output.publicPath
//   })
// );

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

app.get('/canvasversion', (req, res) => {
  res.sendFile(path.join(__dirname, 'example/canvasversion.html'));
});

fs.readdir('./example', (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach(fl => {
      app.get('/' + fl, (req, res) => {
        res.sendFile(path.resolve(__dirname, 'example', fl));
      });
    });
  }
});

app.get('/getKlineTest', (req, res) => {
  fetch('http://hq.test.whup.com/hq/kline/0/0/000001')
    .then(data => {
      return data.json();
    })
    .then(json => {
      res.json(json);
    });
});

const hq = require('@up/hq');

app.get('/getkline', (req, res) => {
  var market = 0; //市场
  var stockCode = '000001'; //股票代码
  var type = 0; //K线类型 0=日K 参考 Common.jce HISTORY_DATA_TYPE 枚举
  var start = 0; //起始位置
  var wantNum = req.query.wantNum || 100; //请求K线个数
  var bXRXDFlag = false; //复权标识  默认false  选填   false：不复权  true：前复权
  hq.getKline(market, stockCode, type, start, wantNum, bXRXDFlag).then(data => {
    let ret = data.vAnalyData.map(
      ({
        fAmount,
        fClose,
        fHigh,
        fLow,
        fOpen,
        lVolume,
        sttDateTime: { iDate }
      }) => {
        return {
          fAmount,
          fClose,
          fHigh,
          fLow,
          fOpen,
          lVolume,
          iDate
        };
      }
    );
    res.json(ret);
  });
});

app.listen(3003, function(err) {
  if (err) {
    return console.error(err);
  }

  // console.log('Listening at http://localhost:3003/');
});
