var PredictChart = require('./PredictChart')
var ChartWithVolume = require('./ChartWithVolume')
var $ = require('jquery')
var fakeData = require('./fake_data/pre.js')
var moment = require('moment')

// fakeData = fakeData.map(function(item) {
//   item.time = moment(item.time).format('YYYY-MM-DD')
//   return item
// })

// console.log(fakeData.length)

var predictData = fakeData.slice(-5)
var last = fakeData[fakeData.length - 6]

predictData = predictData.map(o => {
  o.close = last.close * (1 + o.profit)
  o.low = last.close * (1 + o.flor)
  o.high = last.close * (1 + o.ceil)

  return o
})

var pc = new PredictChart(document.getElementById('root'), {
  	chartWidth: 515,
  	chartHeight: 220,
  	candleData: fakeData.slice(0, 20),
  	predictData: fakeData.slice(-5),
    needVolume: true,
    ticksY: 5,
    tooltip: {
    	className: 'tooltip',
    	fn: function(item) {
    		console.log('item', item)

	    	var { open, close, low, high } = item
        
	    	return `<div style="height:300px;">
          <div>开${open}</div>
          <div>高${high}</div>
          <div>收${close}</div>
          <div>低${low}</div>
        </div>`
	    }
  },
  yAxisFormater: function(value) {
    return Number(value).toFixed(2)
  }
})

pc.draw()

// var cwv = new ChartWithVolume(document.getElementById('container'), {
//  	chartWidth: 360,
//  	chartHeight: 312,
//  	candleData: fakeData.slice(0, 40),
//  	needVolume: true,
//  	cycle: 10,
//   tooltip: {
//     className: 'tooltip',
//     fn: function(item) {
//       console.log('item', item)
//
//       var { open, close, low, high } = item
//       var arr = [open, close, low, high]
//
//       return `<div style="height:300px;">
//           <div>开${open}</div>
//           <div>高${high}</div>
//           <div>收${close}</div>
//           <div>低${low}</div>
//         </div>`
//     }
//   }
// })

// cwv.draw()

$('#showCandlesBtn').on('click', function(e) {
	pc.hidePolySet()
  pc.showCandleSet()
})

$('#showPolylineBtn').on('click', function(e) {
  pc.hideCandleSet()
  pc.showPolySet()
})