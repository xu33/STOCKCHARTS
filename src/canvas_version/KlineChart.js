var start = 0;
var end = 100;
var total = 1000;

var width = 400;
var scale = d3
  .scaleLinear()
  .range([0, width])
  .domain([start, end]);
