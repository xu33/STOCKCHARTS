var data = require('./fake_data/normalizeData');
var moment = require('moment');

import StockChart from './StockChart';
import Timechart from './timecharts/Timechart';
import CandleStickChart from './CandleStickCharts/CandleStickChart';

data = data.map(item => ({
  ...item,
  time: moment(new Date(item.time)).format('YYYY-MM-DD'),
  close: Number(item.close).toFixed(2)
}));

let candleData = new Array(data.length);
let startIndex = 50;
for (let i = startIndex; i < data.length; i++) {
  candleData[i] = data[i];
}

let sc = new StockChart(document.querySelector('#container'), {
  candleData: candleData,
  width: 500,
  height: 300,
  volume: true,
  interactive: true,
  loadingPreviousData: function(length) {
    console.log(`loadingPreviousData length: ${length}`);
    return new Promise(resolve => {
      setTimeout(() => {
        let newData = new Array(data.length);

        startIndex = Math.max(startIndex - length, 0);

        for (let i = startIndex; i < data.length; i++) {
          newData[i] = data[i];
        }

        resolve(newData);
      }, 500);
    });
  }
});

let { chartlist } = require('./fake_data/stocklist.json');
let quote = require('./fake_data/quote.json');
let tc = new Timechart(document.querySelector('#timechart'), {
  width: 500,
  height: 300,
  lastClose: quote.last_close,
  // data: []
  data: chartlist
});

tc.render();

// setTimeout(() => {
//   tc.resize(600, 400);
// }, 2000);

function update() {
  function _update() {
    if (chartlist.length > 0) {
      // tc.update([...chartlist]);
      // chartlist = [];
      tc.update(chartlist.shift());
    }

    setTimeout(_update, 17);
  }

  _update();
}

// update();

// 重构K线图
let csc = new CandleStickChart('#refactor', {
  width: 500,
  height: 300,
  data: data.slice(150)
});

csc.render();
