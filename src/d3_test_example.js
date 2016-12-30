/**
 * Created by shinan on 2016/12/29.
 */
import { WIN_COLOR, LOSS_COLOR, TEXT_MARGIN } from './libs/config'
import './css/d3.css'
const d3 = require('d3')
const svg = d3.select('body').append('svg')
var oriData = require('./fake_data/d3data.js')

console.log(oriData.chartDataList)

var data = oriData.klineList
var predictData = oriData.chartDataList
var last = data[data.length - 1]

predictData.unshift({
  high: last.close,
  low: last.close,
  close: last.close
})

var all = data.concat(predictData)

const width = 300
const height = 250

svg.attr('width', width + 1).attr('height', height + 50)

var scaleX = d3.scaleBand().domain(data.map((o, i) => i)).range([0, width - 100]).padding(0.4)
var min = d3.min(all, d => d.low)
var max = d3.max(all, d => d.high)
var scaleY = d3.scaleLinear().domain([0, 1]).range([height, 0])

console.log(scaleY.ticks(30).map(d3.format('.2f')))

var axis = d3.axisRight(scaleY)

svg.append('g').call(axis)

// function predictLines() {
//   var g = svg.append('g').attr('transform', `translate(200, 0)`)
//   // 预测部分虚框
//   var area = d3.area()
//     .x(function(d) {
//       return d.x
//     })
//     .y0(0)
//     .y1(function(d) {
//       return d.y
//     })
//
//   g.append('path').datum([{
//     x: 0,
//     y: height
//   }, {
//     x: 100,
//     y: height
//   }])
//     .attr('d', area).attr('class', 'predict')
//
//   // 预测部分折线
//   var scaleX = d3.scaleLinear().domain([0, predictData.length - 1]).range([0, 100])
//
//   var lineCeil = d3.line()
//     .y(d => scaleY(d.high))
//     .x((d, i) => scaleX(i))
//
//   g.append('path')
//     .datum(predictData)
//     .attr('class', 'ceil')
//     .attr('d', lineCeil)
//
//   var lineProfit = d3.line()
//     .y(d => scaleY(d.close))
//     .x((d, i) => scaleX(i))
//
//   g.append('path')
//     .datum(predictData)
//     .attr('class', 'profit')
//     .attr('d', lineProfit)
//
//   var lineFlor = d3.line()
//     .y(d => scaleY(d.low))
//     .x((d, i) => scaleX(i))
//
//   g.append('path')
//     .data(predictData)
//     .attr('class', 'flor')
//     .attr('d', lineFlor)
// }
//
// predictLines()
//
// // 蜡烛线
// function candleStick() {
//   svg
//     .selectAll('rect')
//     .data(data)
//     .enter()
//     .append('rect')
//     .attr('class', 'bar')
//     .attr('x', (d, i) => scaleX(i))
//     .attr('y', d => {
//       return scaleY(Math.max(d.open, d.close))
//     })
//     .attr('width', scaleX.bandwidth())
//     .attr('height', d => {
//       return scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close))
//     })
//     .attr('fill', d => {
//       return d.open > d.close ? WIN_COLOR : LOSS_COLOR
//     })
//
//   var line = d3.line().x(d=>d.x).y(d=>d.y)
//
//   svg.selectAll('path.shadow')
//     .data(data)
//     .enter()
//     .append('path')
//     .attr('class', 'shadow')
//     .attr('d', (d, i) => {
//       var x = scaleX(i) + scaleX.bandwidth() / 2
//       var y1 = scaleY(d.high)
//       var y2 = scaleY(d.low)
//
//       return line([{x: x, y: y1}, {x: x, y: y2}])
//     })
//     .attr('stroke', d => {
//       return d.open > d.close ? WIN_COLOR : LOSS_COLOR
//     })
// }
//
// candleStick()
//
// // 数轴&辅助线
// function axis() {
//   var scaleXReal = d3.scaleOrdinal()
//     .domain([data[0].time, data[data.length - 1].time, predictData[predictData.length - 1].time])
//     .range([0, 200, width])
//
//   // 底部X轴
//   var axisX = d3.axisBottom(scaleXReal).tickSize(0).tickPadding(TEXT_MARGIN)
//   // 右侧Y轴
//   var axisY = d3.axisLeft(scaleY).tickSize(0).ticks(4).tickPadding(TEXT_MARGIN)
//   // 顶部X轴（辅助线）
//   var topAxis = d3.axisBottom(scaleXReal).tickSize(height).tickFormat('')
//   // 左侧Y轴
//   var leftAxis = d3.axisRight(scaleY).tickSize(width).ticks(4).tickFormat('')
//
//   svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(topAxis)
//   svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(leftAxis)
//
//   var axisXElement = svg.append('g').attr('class', 'axis').attr('transform', `translate(0, ${height})`).call(axisX)
//   var axisYElement = svg.append('g').attr('class', 'axis').attr('transform', `translate(${width}, 0)`).call(axisY)
//
//   axisXElement.selectAll('.tick text').attr('text-anchor', 'end')
//   axisXElement.select('.tick text').attr('text-anchor', 'start')
//
//   axisYElement.call(selection => {
//     selection.selectAll('.tick text').attr('transform', `translate(0, -10)`)
//   })
// }
//
// axis()

// class Predict {
//   constructor(options) {
//     this.svg = svg = d3.select('body').append('svg')
//   }
// }

// var scaleLinear = d3.scaleLinear
// var s = scaleLinear().domain([0.122, 0.555]).range([0, 300])
// var s1 = scaleLinear().domain([0.12, 0.55]).range([0, 300])
// console.log(s(0.155))
// console.log(s1(0.15))