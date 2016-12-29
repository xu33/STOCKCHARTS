/**
 * Created by shinan on 2016/12/29.
 */
import { WIN_COLOR, LOSS_COLOR } from './libs/config'
import './css/d3.css'
const d3 = require('d3')
const svg = d3.select('body').append('svg')
var oriData = require('./fake_data/pre.js')
var data = oriData.slice(0, 30)

const width = 400
const height = 300

svg.attr('width', 500).attr('height', 400)
var scaleX = d3.scaleBand().domain(data.map((o, i) => i)).range([0, width]).padding(0.4)
var min = d3.min(data, d => d.low)
var max = d3.max(data, d => d.high)

console.log(min, max)

var scaleY = d3.scaleLinear().domain([min - 2, max + 2]).range([height, 0])
var line = d3.line().x(d=>d.x).y(d=>d.y)

svg.append('g')
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', (d, i) => scaleX(i))
  .attr('y', d => {
    return scaleY(Math.max(d.open, d.close))
  })
  .attr('width', scaleX.bandwidth())
  .attr('height', d => {
    return scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close))
  })
  .attr('fill', d => {
    return d.open > d.close ? WIN_COLOR : LOSS_COLOR
  })

svg.selectAll('path.shadow')
  .data(data)
  .enter()
  .append('path')
  .attr('class', 'shadow')
  .attr('d', (d, i) => {
    var x = scaleX(i) + scaleX.bandwidth() / 2
    var y1 = scaleY(d.high)
    var y2 = scaleY(d.low)

    return line([{x: x, y: y1}, {x: x, y: y2}])
  })
  .attr('stroke', d => {
    return d.open > d.close ? WIN_COLOR : LOSS_COLOR
  })

var scaleXReal = d3.scaleOrdinal()
  .domain(['2011-01-01', '2011-01-02', '2011-01-03'])
  .range([0, 300, 400])

// 底部X轴
var axisX = d3.axisBottom(scaleXReal).tickSize(0).tickPadding(5)
// 右侧Y轴
var axisY = d3.axisLeft(scaleY).tickSize(0).ticks(4).tickFormat(vol => vol.toFixed(2)).tickPadding(5)
// 顶部X轴（辅助线）
var topAxis = d3.axisBottom(scaleXReal).tickSize(height).tickFormat('')
// 左侧Y轴
var leftAxis = d3.axisRight(scaleY).ticks(4).tickSize(width).tickFormat('')

svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(topAxis)
svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(leftAxis)

var o = svg.append('g').attr('class', 'axis').attr('transform', `translate(0, ${height})`).call(axisX)
svg.append('g').attr('class', 'axis').attr('transform', `translate(${width}, 0)`).call(axisY)

o.selectAll('.tick text').attr('text-anchor', 'end')
o.select('.tick text').attr('text-anchor', 'start')

// var scaleLinear = d3.scaleLinear
// var s = scaleLinear().domain([0.122, 0.555]).range([0, 300])
// var s1 = scaleLinear().domain([0.12, 0.55]).range([0, 300])
// console.log(s(0.155))
// console.log(s1(0.15))