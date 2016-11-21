var PredictChart = require('./predict')
var ChartWithVolume = require('./ChartWithVolume')

window.onload = function() {
	var fakeData = PredictChart.fakeData
	var pc = new PredictChart(document.getElementById('root'), {
		chartWidth: 300,
		chartHeight: 200,
		candleData: fakeData.slice(0, 20),
		predictData: fakeData.slice(-5),
		needVolume: false,
    needVolume: true,
    ticksY: 4
	})

	pc.draw()

	var cwv = new ChartWithVolume(document.getElementById('container'), {
	 	chartWidth:400,
	 	chartHeight:300,
	 	candleData: fakeData.slice(0, 60),
	 	needVolume: true,
	 	cycle: 20
	})

	cwv.draw()
}