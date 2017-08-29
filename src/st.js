// var data = require('./fake_data/normalizeData');
// var moment = require('moment');

// import StockChart from './StockChart';
// let candleData = data.map(item => ({
//   ...item,
//   time: moment(new Date(item.time)).format('YYYY-MM-DD')
// }));

// new StockChart(document.querySelector('#container'), {
//   candleData: [...candleData],
//   width: 600,
//   height: 300,
//   volume: true,
//   interactive: true
// });

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

const d3 = require('d3');

console.log(d3.range(0, 300, 30));
