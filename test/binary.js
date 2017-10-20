const bounds = require('binary-search-bounds');
var array = [1, 2, 5, 6, 10, 11, 13, 50, 1000, 2200];

console.log(bounds.gt(array, 4));
