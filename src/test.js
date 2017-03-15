// const d3 = require('d3')

// var data = [5, 3, 4, 1]

// /*
// Thinking with joins means declaring a relationship between a selection (such as "circle") and data, 
// and then implementing this relationship through the three enter, update and exit states.
// */

// function update(data) {
// 	var divs = d3.selectAll('div').data(data)

// 	divs.enter().append('div')
// 		.attr('class', 'enter')
// 		.merge(divs)
// 		.style('height', d => (d * 10) + 'px')
// 		.style('width', d => 10 + 'px')
// 		.style('left', (d, i) => (10 + 5) * i + 'px')
// 		.text(d => d)

// 	divs.exit().remove()	
// }

// update(data)

// setTimeout(function() {
// 	var d = [3, 5, 2, 8]
// 	update(d)
// }, 1000)

var data = require('./fake_data/gold')
var TimeTrendChart = require('./mobile/TimeTrendChart')

var prices = data.prices.slice(1)
var volumes = data.volumes.slice(1)

data.prices = data.prices.slice(0, 1)
data.volumes = data.volumes.slice(0, 1)

var ttc = new TimeTrendChart({
  width: 400,
  height: 300,
  container: '#time-chart-container',
  data: data
})

var ticker = setInterval(() => {
  var data = ttc.data

  data.prices.push(prices.shift())
  data.volumes.push(volumes.shift())

  if (prices.length <= 0 || volumes.length <= 0) {
    clearInterval(ticker)
  }

  ttc.update(data)
}, 10)