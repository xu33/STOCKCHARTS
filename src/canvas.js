var d3 = require('d3');
var width = 750;
var height = 400;
var canvas = d3
  .select('#container')
  .append('canvas')
  .attr('width', width)
  .attr('height', height);
var context = canvas.node().getContext('2d');
var customBase = document.createElement('custom');
var custom = d3.select(customBase); // 相当于最外层svg
var groupSpacing = 4;
var cellSpacing = 2;
var offsetTop = height / 5;
var cellSize = Math.floor((width - 11 * groupSpacing) / 100) - cellSpacing;

function databind(data) {
  var colourScale = d3.scaleSequential(d3.interpolatePiYG).domain(
    d3.extent(data, function(d) {
      return d;
    })
  );
  var join = custom.selectAll('custon.rect').data(data);
  var enterSel = join
    .enter()
    .append('custom')
    .attr('class', 'rect')
    .attr('x', function(d, i) {
      var x0 = Math.floor(i / 100) % 10;
      var x1 = Math.floor(i % 10);
      return groupSpacing * x0 + (cellSpacing + cellSize) * (x1 + x0 * 10);
    })
    .attr('y', function(d, i) {
      var y0 = Math.floor(i / 1000);
      var y1 = Math.floor((i % 100) / 10);
      return groupSpacing * y0 + (cellSpacing + cellSize) * (y1 + y0 * 10);
    })
    .attr('width', 0)
    .attr('height', 0);

  join
    .merge(enterSel)
    .transition()
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('fillStyle', function(d) {
      return colourScale(d);
    });

  var exitSel = join
    .exit()
    .transition()
    .attr('width', 0)
    .attr('height', 0)
    .remove();
}

var selection = d3.selectAll('h2').append('p');
console.log(selection);
