var oriData = require('./fake_data/d3data.js');
var candleData = oriData.klineList;
var predictData = oriData.chartDataList;
var Predict = require('./Predict');
// var SampleChart = require('./Sample')

var p = new Predict(document.querySelector('#container'), {
  candleData: candleData,
  predictData: predictData,
  width: 600,
  height: 400,
  // volume: true,
  interactive: true
});

// p.on('drag-start', index => {
// 	console.log(index)
// })

// p.on('drag-move', index => {
// 	console.log(index)
// })

var show = true;
document.querySelector('#showCandlesBtn').addEventListener('click', e => {
  p.toggleCandle(true);
  p.togglePoly(false);
});

document.querySelector('#showPolylineBtn').addEventListener('click', e => {
  p.toggleCandle(false);
  p.togglePoly(true);
});

// var p = new SampleChart(document.querySelector('#container'), {
//   candleData: candleData,
//   width: 350,
//   height: 220,
//   volume: true,
//   interactive: true,
//   cycle: 5
// })
