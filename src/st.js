import CandleStickChart from './CandleStickCharts/CandleStickChart';
import $ from 'jquery';
import computeMa from './utils/computeMa';
// import Timechart from './timecharts/Timechart';

// let { chartlist } = require('./fake_data/stocklist.json');
// let quote = require('./fake_data/quote.json');
// let tc = new Timechart(document.querySelector('#timechart'), {
//   width: 600,
//   height: 400,
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

// csc.render();
// 分钟K线更新例子
// setTimeout(() => {
//   csc.update(data.chartlist[data.chartlist.length - 1]);
// }, 2000);

// 类型更新例子
// $('.tabs').on('click', 'li', function(e) {
//   csc.destroy();

//   var type = String($(this).data('type'));
//   var klineType;

//   if (type === 'D') {
//     klineType = 0;
//   } else if (type === 'W') {
//     klineType = 7;
//   } else if (type === 'M') {
//     klineType = 8;
//   } else if (type === '1') {
//     klineType = 1;
//   } else if (type === '5') {
//     klineType = 2;
//   } else if (type === '15') {
//     klineType = 3;
//   } else if (type === '30') {
//     klineType = 4;
//   } else if (type === '60') {
//     klineType = 5;
//   }

//   $.ajax({
//     url: `http://hq.test.whup.com/hq/kline/${klineType}/0/000001`
//   }).done(data => {
//     csc = new CandleStickChart('#refactor', {
//       width: 500,
//       height: 300,
//       data: data.vAnalyData,
//       type: type
//     });
//   });
// });

function throttle(fn, duration) {
  var timer;
  var start;
  return function(e) {
    if (timer) {
      return;
    }

    timer = setTimeout(function() {
      fn(e);
      timer = undefined;
    }, duration);
  };
}

$(document).ready(function() {
  var element = document.getElementById('refactor');
  var chart;

  $.ajax({
    url: `http://hq.test.whup.com/hq/kline/8/0/002405`
  }).done(data => {
    var width = element.clientWidth;
    var height = element.clientHeight;
    var list = data.vAnalyData;
    computeMa(list, 'close', 5);
    computeMa(list, 'close', 10);
    computeMa(data.vAnalyData, 'close', 20);
    computeMa(data.vAnalyData, 'close', 60);

    chart = new CandleStickChart('#refactor', {
      width: width,
      height: height,
      data: list
    });
  });

  $(window).resize(
    throttle(function() {
      chart.resize(element.clientWidth, element.clientHeight);
    }, 300)
  );
});
