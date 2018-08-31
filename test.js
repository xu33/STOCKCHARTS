// const fs = require('fs');
// const path = require('path');
// fs.readdir('./example', (err, files) => {
//   console.log(files);
//   files.forEach(fl => {
//     console.log(path.resolve(__dirname, 'example', fl));
//   });
// });
// var d3 = require('d3');
// var interpolator = d3.interpolateNumber(1.52, 3.33);
// for (var i = 0; i <= 1; i += 0.2) {
//   console.log(interpolator(i).toFixed(2));
// }
var zoomed = function() {
  var transform = d3.event.transform;
  zoomTargetElement.attr('transform', transform.toString());
};
var zoomBaseElement = d3.select('body').append('svg');
var zoom = d3.zoom().on('zoom', zoomed);
zoomBaseElement.call(zoom);

var t = d3.zoomIdentity.translateBy(tx, ty).scale(k);
zoomBaseElement.call(zoom.transform, t);
/*
newx = transform.tx + transform.k * x
  |
invertX = (x - transform.tx) / transform.k
*/
function rescaleX(x) {
  var range = x.range().map(transform.invertX, transform);
  var domain = range.map(x.invert, x);

  return x.copy().domain(domain);
}
