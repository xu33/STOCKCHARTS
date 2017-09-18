var data = require('./fake_data/normalizeData');
var moment = require('moment');

import StockChart from './StockChart';
import Timechart from './Timechart';

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

// new StockChart(document.querySelector('#container'), {
//   candleData: candleData,
//   width: 1000,
//   height: 600,
//   volume: true,
//   interactive: true,
//   loadingPreviousData: function(length) {
//     console.log(`loadingPreviousData length: ${length}`);
//     return new Promise(resolve => {
//       setTimeout(() => {
//         let newData = new Array(data.length);

//         startIndex = Math.max(startIndex - length, 0);

//         for (let i = startIndex; i < data.length; i++) {
//           newData[i] = data[i];
//         }

//         resolve(newData);
//       }, 500);
//     });
//   }
// });

const { chartlist } = require('./fake_data/stocklist.json');
let tc = new Timechart(document.querySelector('#timechart'), {
  width: 500,
  height: 300,
  data: []
});

function update() {
  function _update() {
    if (chartlist.length > 0) {
      tc.update(chartlist.shift());
    }

    setTimeout(_update, 1000);
  }

  _update();
}

update();
