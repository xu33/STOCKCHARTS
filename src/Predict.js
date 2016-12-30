/**
 * Created by shinan on 2016/12/29.
 */
import { WIN_COLOR, LOSS_COLOR } from './libs/config'
import './css/d3.css'
const d3 = require('d3')
var oriData = require('./fake_data/d3data.js')

var candleData = oriData.klineList
var predictData = oriData.chartDataList

const PREDICT_PERCENT = 0.7
const MARGIN_BOTTOM = 20
const MARGIN_RIGHT = 2
const TEXT_MARGIN = 5

class Predict {
  constructor(selector, options) {
    this.options = options

    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', options.width)
      .attr('height', options.height)

    this.options.height = options.height - MARGIN_BOTTOM
    this.options.width = options.width - MARGIN_RIGHT

    let { candleData, predictData } = options
    let all = candleData.concat(predictData)

    let min = d3.min(all, d => d.low)
    let max = d3.max(all, d => d.high)
    let scaleY = d3.scaleLinear().domain([min, max]).range([this.options.height, 0])

    this.scaleY = scaleY
    this.render()
  }

  // 预测线
  predictLines() {
    var { svg, scaleY } = this
    var { height, width, candleData, predictData } = this.options
    var offset = width * PREDICT_PERCENT
    var g = svg.append('g').attr('transform', `translate(${offset}, 0)`)
    // 预测部分虚框
    var area = d3.area()
      .x(function(d) {
        return d.x
      })
      .y0(0)
      .y1(function(d) {
        return d.y
      })

    g.append('path').datum([{
      x: 0,
      y: height
    }, {
      x: width * (1 - PREDICT_PERCENT),
      y: height
    }])
      .attr('d', area).attr('class', 'predict')

    var last = candleData[candleData.length - 1]

    predictData.unshift({
      high: last.close,
      low: last.close,
      close: last.close
    })

    // 预测部分折线
    var scaleX = d3.scaleLinear().domain([0, predictData.length - 1]).range([0, width * (1 - PREDICT_PERCENT)])

    var lineCeil = d3.line()
      .y(d => scaleY(d.high))
      .x((d, i) => scaleX(i))

    g.append('path')
      .datum(predictData)
      .attr('class', 'ceil')
      .attr('d', lineCeil)

    var lineProfit = d3.line()
      .y(d => scaleY(d.close))
      .x((d, i) => scaleX(i))

    g.append('path')
      .datum(predictData)
      .attr('class', 'profit')
      .attr('d', lineProfit)

    var lineFlor = d3.line()
      .y(d => scaleY(d.low))
      .x((d, i) => scaleX(i))

    g.append('path')
      .datum(predictData)
      .attr('class', 'flor')
      .attr('d', lineFlor)
  }

  // 蜡烛线
  candleSticks() {
    var { svg, scaleY } = this
    var { height, width, candleData } = this.options
    var offset = width * PREDICT_PERCENT
    var scaleX = d3.scaleBand().domain(candleData.map((o, i) => i)).range([0, offset]).padding(0.4)

    svg
      .selectAll('rect')
      .data(candleData)
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

    var line = d3.line().x(d=>d.x).y(d=>d.y)

    svg.selectAll('path.shadow')
      .data(candleData)
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
  }

  // 数轴&辅助线
  axis() {
    var { svg, scaleY } = this
    var { height, width, candleData, predictData } = this.options
    var offset = width * PREDICT_PERCENT

    var scaleXReal = d3.scaleOrdinal()
      .domain([candleData[0].time, candleData[candleData.length - 1].time, predictData[predictData.length - 1].time])
      .range([0, offset, width])

    // 底部X轴
    var axisX = d3.axisBottom(scaleXReal).tickSize(0).tickPadding(TEXT_MARGIN)
    // 右侧Y轴
    var axisY = d3.axisLeft(scaleY).tickSize(0).ticks(2, '.2f').tickPadding(TEXT_MARGIN)
    // 顶部X轴（辅助线）
    var topAxis = d3.axisBottom(scaleXReal).tickSize(height).tickFormat('')
    // 左侧Y轴
    var leftAxis = d3.axisRight(scaleY).tickSize(width).ticks(2).tickFormat('')

    svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(topAxis)
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(leftAxis)

    var axisXElement = svg.append('g').attr('class', 'axis').attr('transform', `translate(0, ${height})`).call(axisX)
    var axisYElement = svg.append('g').attr('class', 'axis').attr('transform', `translate(${width}, 0)`).call(axisY)

    axisXElement.selectAll('.tick text').attr('text-anchor', 'end')
    axisXElement.select('.tick text').attr('text-anchor', 'start')

    axisYElement.call(selection => {
      selection.selectAll('.tick text').attr('transform', `translate(0, -10)`)
    })
  }

  render() {
    this.predictLines()
    this.candleSticks()
    this.axis()
  }
}

var p = new Predict('body', {
  candleData: candleData,
  predictData: predictData,
  width: 400,
  height: 300
})