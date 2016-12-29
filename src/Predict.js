/**
 * Created by shinan on 2016/12/29.
 */
import './css/d3.css'
const d3 = require('d3')
const svg = d3.select('body').append('svg')
var data = require('./fake_data/pre.js').slice(0, 30)

const width = 400
const height = 300

svg.attr('width', 500).attr('height', 400)
var scaleX = d3.scaleBand().domain(data.map((o, i) => i)).range([0, width]).padding(0.4)

console.log(scaleX.bandwidth())

var min1 = data.reduce((prev, curr) => {
  return curr.low < prev.low ? curr : prev
})



var min = d3.min(data, d => d.low)
var max = d3.max(data, d => d.high)

console.log(min, max)

var scaleY = d3.scaleLinear().domain([min, max]).range([0, height])
var line = d3.line().x(d=>d.x).y(d=>d.y)

svg.append('g')
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', (d, i) => scaleX(i))
  .attr('y', d => {
    return height - scaleY(Math.max(d.open, d.close))
  })
  .attr('width', scaleX.bandwidth())
  .attr('height', d => {
    return scaleY(Math.max(d.open, d.close)) - scaleY(Math.min(d.open, d.close))
  })
  .attr('fill', d => {
    return d.open > d.close ? 'red' : 'green'
  })

svg.selectAll('path.shadow')
  .data(data)
  .enter()
  .append('path')
  .attr('class', 'shadow')
  .attr('d', (d, i) => {
    var x = scaleX(i) + scaleX.bandwidth() / 2
    var y1 = height- scaleY(d.high)
    var y2 = height - scaleY(d.low)

    return line([{x: x, y: y1}, {x: x, y: y2}])
  })
  .attr('stroke', d => {
    return d.open > d.close ? 'red' : 'green'
  })

var scaleXReal = d3.scaleOrdinal()
  .domain(['2011-01-01', '2011-01-02', '2011-01-03'])
  .range([0, 300, 400])

var axisX = d3.axisBottom(scaleXReal).tickSize(0)
var axisY = d3.axisLeft(scaleY).tickSize(0).tickFormat(vol => vol.toFixed(2)).ticks(4)
var axisBottom = d3.axisBottom(scaleXReal).tickSize(height).tickFormat('')
var axisRight = d3.axisRight(scaleY).ticks(4).tickSize(width).tickFormat('')

var o = svg.append('g').attr('class', 'axis').attr('transform', `translate(0, ${height})`).call(axisX)
svg.append('g').attr('class', 'axis').attr('transform', `translate(${width}, 0)`).call(axisY)
svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(axisBottom)
svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(axisRight)
o.selectAll('.tick text').attr('text-anchor', 'end')
o.select('.tick text').attr('text-anchor', 'start')

// var scaleLinear = d3.scaleLinear
// var s = scaleLinear().domain([0.122, 0.555]).range([0, 300])
// var s1 = scaleLinear().domain([0.12, 0.55]).range([0, 300])
// console.log(s(0.155))
// console.log(s1(0.15))

