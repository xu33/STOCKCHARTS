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

var curr = data.slice(0, 10)
var rest = data.slice(10)

var ttc = new TimeTrendChart({
  width: 320,
  height: 200,
  container: '#time-chart-container',
  data: curr
})

ttc.on('change', v => {
  // console.log(v)
})
// 更新
function updateA() {
  var data = ttc.data

  data.push(rest.shift())

  ttc.update(data)

  if (rest.length <= 0) {
    return
  }

  requestAnimationFrame(updateA)
}

updateA()

var klineData = require('./fake_data/goldkline')
var CandleStickChart = require('./mobile/CandleStickChart')
var curr1 = klineData.slice(0, 10)
var rest1 = klineData.slice(10)

var csc = new CandleStickChart({
  width: 320,
  height: 200,
  container: '#cs-wrap',
  data: curr1
})

function update() {
  var data = csc.data

  data.push(rest1.shift())

  csc.update(data)

  if (rest1.length <= 0) return

  requestAnimationFrame(update)
}

update()