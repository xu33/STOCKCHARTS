var PredictChart = require('./predict')
var ChartWithVolume = require('./ChartWithVolume')

window.onload = function() {
	var fakeData = PredictChart.fakeData

	var pc = new PredictChart(document.getElementById('root'), {
		chartWidth: 300,
		chartHeight: 200,
		candleData: fakeData.slice(0, 20),
		predictData: fakeData.slice(-5),
	    needVolume: true,
	    ticksY: 4,
	    tooltip: function(item) {
	    	var { open, close, low, high } = item
	    	
	    	return `${open}${close}${low}${high}`
	    }
	})

	pc.draw()

	var cwv = new ChartWithVolume(document.getElementById('container'), {
	 	chartWidth:400,
	 	chartHeight:300,
	 	candleData: fakeData.slice(0, 40),
	 	needVolume: true,
	 	cycle: 10,
	 	tooltip: function(item) {
	    	var { open, close, low, high } = item
	    	
	    	return `${open}${close}${low}${high}`
	    }
	})

	cwv.draw()
}