import CandleStickChart from './CandleStickCharts/CandleStickChart';
import Timechart from './timecharts/Timechart';

let { chartlist } = require('./fake_data/stocklist.json');
let quote = require('./fake_data/quote.json');
let tc = new Timechart(document.querySelector('#timechart'), {
  width: 500,
  height: 300,
  lastClose: quote.last_close,
  data: chartlist
});

tc.render();

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

let data = require('./fake_data/stocklist_day.json');

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
  url: 'http://localhost:3000/hq/kline',
  data: {
    market: 0,
    code: '000002',
    wantNum: 500
  }
}).done(data => {
  csc = new CandleStickChart('#refactor', {
    width: 500,
    height: 300,
    data: data.vAnalyData,
    type: 'D'
  });
});

// 类型更新例子
$('.tabs').on('click', 'li', function(e) {
  csc.destroy();

  var type = String($(this).data('type'));

  // if (type === 'D') {
  //   var data = require('./fake_data/stocklist_day.json');
  // } else if (type === 'W') {
  //   var data = require('./fake_data/stocklist_week.json');
  // } else if (type === 'M') {
  //   var data = require('./fake_data/stocklist_month.json');
  // } else if (type === '1') {
  //   var data = require('./fake_data/stocklist_one_minute.json');
  // } else if (type === '5') {
  //   var data = require('./fake_data/stocklist_five_minute.json');
  // } else if (type === '15') {
  //   var data = require('./fake_data/stocklist_fifteen_minute.json');
  // } else if (type === '30') {
  //   var data = require('./fake_data/stocklist_30_minute.json');
  // } else if (type === '60') {
  //   var data = require('./fake_data/stocklist_60_minute.json');
  // }

  // csc = new CandleStickChart('#refactor', {
  //   width: 500,
  //   height: 300,
  //   data: data.chartlist,
  //   type: type
  // });

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
    url: 'http://localhost:3000/hq/kline',
    data: {
      market: 0,
      code: '000002',
      wantNum: 300,
      type: klineType
    }
  }).done(data => {
    csc = new CandleStickChart('#refactor', {
      width: 500,
      height: 300,
      data: data.vAnalyData,
      type: type
    });
  });
});
