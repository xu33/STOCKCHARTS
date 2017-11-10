import CandleStickChart from './CandleStickCharts/CandleStickChart';
import Timechart from './timecharts/Timechart';

// let { chartlist } = require('./fake_data/stocklist.json');
// let quote = require('./fake_data/quote.json');
// let tc = new Timechart(document.querySelector('#timechart'), {
//   width: 500,
//   height: 300,
//   lastClose: quote.last_close,
//   data: chartlist,
//   onChange: function(item) {
//     console.log(item);
//   }
// });

// tc.render();

// function update() {
//   function _update() {
//     if (chartlist.length > 0) {
//       // tc.update([...chartlist]);
//       // chartlist = [];
//       tc.update(chartlist.shift());
//     }

//     setTimeout(_update, 17);
//   }

//   _update();
// }

// update();

// let data = require('./fake_data/stocklist_day.json');

// 重构K线图
// let csc = new CandleStickChart('#refactor', {
//   width: 500,
//   height: 300,
//   data: data.chartlist.slice(0, data.chartlist.length - 1),
//   type: 'D'
// });

// csc.render();
// 分钟K线更新例子
// setTimeout(() => {
//   csc.update(data.chartlist[data.chartlist.length - 1]);
// }, 2000);

import $ from 'jquery';
var csc;
$.ajax({
  url: `http://hq.test.whup.com/hq/kline/8/0/000001`
}).done(data => {
  csc = new CandleStickChart('#refactor', {
    width: 500,
    height: 300,
    data: data.vAnalyData,
    type: 'M'
  });
});

// 类型更新例子
$('.tabs').on('click', 'li', function(e) {
  csc.destroy();

  var type = String($(this).data('type'));
  var klineType;

  if (type === 'D') {
    klineType = 0;
  } else if (type === 'W') {
    klineType = 7;
  } else if (type === 'M') {
    klineType = 8;
  } else if (type === '1') {
    klineType = 1;
  } else if (type === '5') {
    klineType = 2;
  } else if (type === '15') {
    klineType = 3;
  } else if (type === '30') {
    klineType = 4;
  } else if (type === '60') {
    klineType = 5;
  }

  $.ajax({
    url: `http://hq.test.whup.com/hq/kline/${klineType}/0/000001`
  }).done(data => {
    csc = new CandleStickChart('#refactor', {
      width: 500,
      height: 300,
      data: data.vAnalyData,
      type: type
    });
  });
});
