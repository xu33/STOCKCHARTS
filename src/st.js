var data = require('./fake_data/normalizeData');
var moment = require('moment');

import StockChart from './StockChart';

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

new StockChart(document.querySelector('#container'), {
  candleData: candleData,
  width: 1000,
  height: 600,
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

// let d3 = require('d3');
// let svg = d3.select('body').append('svg');

// svg.attr('height', 400).attr('width', 300);

// let rect = svg
//   .selectAll('rect')
//   .data([1])
//   .enter()
//   .append('rect')
//   .attr('width', 400)
//   .attr('height', 300)
//   .attr('fill', '#ccc');

// let zoomBehavior = d3
//   .zoom()
//   .on('zoom', function() {
//     console.log(d3.event.transform);
//   })
//   .scaleExtent([0, 2]);

// rect.call(zoomBehavior);

// const d3 = require('d3');

// console.log(d3.ticks(0, 300, 10));
