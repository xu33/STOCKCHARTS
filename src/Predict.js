/**
 * Created by shinan on 2016/12/29.
 */
const d3 = require('d3')
// const scaleX = d3.scaleLinear().domain([10, 30]).range([0, 400])
// const axis = d3.axisBottom(scaleX).tickValues([1, 2, 3, 3, 3]).tickSize(0, 0).tickPadding(15)
//
// d3.select('body').append('svg')
//   .attr('width', 500)
//   .attr('height', 400)
// .append('g')
//   .attr('class', 'y-axis')
//   .attr('transform', 'translate(0, 0)')
//   .call(axis)

var data = [
  {x:0, y:18},
  {x:20, y:27},
  {x:40, y:56},
  {x:60, y:34},
  {x:80, y:41},
  {x:100, y:35},
  {x:120, y:100},
  {x:140, y:37},
  {x:160, y:26},
  {x:180, y:21}
];

var width = 240,
  height = 120;

var s = d3.select('body').append('svg');

s.attr({
  'width': width,
  'height': height,
});

var area = d3.area()
  .x(function(d) { return d.x; })
  .y0(0)
  .y1(function(d) { return d.y; });

s.append('path')
  .attr({
    'd':area(data),
    'stroke':'#c00',
    'fill':'rgba(255,0,0,.3)',
    'transform':'translate(2,2)'
  });