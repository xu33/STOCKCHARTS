var PredictChart = require('./PredictChart')
var ChartWithVolume = require('./ChartWithVolume')
var $ = require('jquery')

window.onload = function() {
	var fakeData = PredictChart.fakeData

	var pc = new PredictChart(document.getElementById('root'), {
		chartWidth: 400,
		chartHeight: 300,
		candleData: fakeData.slice(0, 20),
		predictData: fakeData.slice(-5),
	    needVolume: true,
	    ticksY: 5,
	    tooltip: {
	    	className: 'tooltip',
	    	fn: function(item) {
	    		// console.log('item', item)

		    	var { open, close, low, high } = item
		    	
		    	return `<div style="height:300px;">${open}${close}${low}${high}</div>`
		    }
	  }
	})

	pc.draw()

	var cwv = new ChartWithVolume(document.getElementById('container'), {
	 	chartWidth: 400,
	 	chartHeight: 300,
	 	candleData: fakeData.slice(0, 40),
	 	needVolume: true,
	 	cycle: 10,
	 	tooltip: {
	    	className: 'tooltip',
	    	fn: function(item) {
	    		// console.log('item', item)

		    	var { open, close, low, high } = item
		    	
		    	return `<div style="height:300px;">${open}${close}${low}${high}</div>`
		    }
	  }
	})

	cwv.draw()

	$('#showCandlesBtn').on('click', function(e) {
		cwv.hidePolySet()
		cwv.showCandleSet()
	})

	$('#showPolylineBtn').on('click', function(e) {
		cwv.hideCandleSet()
		cwv.showPolySet()
	})

	$('#clearBtn').on('click', function(e) {
		pc.clear()
		cwv.clear()
	})
}