// const scaleLinear = function() {
//   var min, max

//   var normalize = function(x) {
//     return (x - min) / (max - min)
//   }

//   var domain = function(arr) {
//     min = arr[0]
//     max = arr[arr.length - 1]

//     return this
//   }

//   var range = function(arr) {
//     var a = arr[0]
//     var b = arr[arr.length - 1]

//     a = +a
//     b -= a

//     return function(x) {
//       return a + b * normalize(x)
//     }
//   }

//   var rangeRound = function(arr) {
//     var a = arr[0]
//     var b = arr[arr.length - 1]

//     a = +a
//     b -= a

//     return function(x) {
//       return Math.round( a + b * normalize(x) )
//     }
//   }

//   return {
//     domain,
//     range,
//     rangeRound
//   }
// }

const scaleLinear = require('d3-scale').scaleLinear

module.exports = scaleLinear