/**
 * Created by shinan on 2017/1/22.
 */
const d3 = require('d3')
import { WIN_COLOR, LOSS_COLOR, EQUAL_COLOR } from './libs/config'
import './css/d3.css'
const str2number = require('./libs/str2number')
const PREDICT_PERCENT = 0.7
const MARGIN_BOTTOM = 15
const MARGIN_RIGHT = 2
const TEXT_MARGIN = 5
const VOL_HEIGHT = 66
const EventEmitter = require('events')
const moment = require('moment')

class StockChart extends EventEmitter {
  constructor(selector, options) {
    super()
    this.selector = selector
    this.options = options

    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', options.width)
      .attr('height', options.height)

    this.totalHeight = this.options.height
    this.candleStickAreaHeight = options.height - MARGIN_BOTTOM
    this.options.width = options.width - MARGIN_RIGHT

    if (this.options.volume) {
      this.candleStickAreaHeight -= VOL_HEIGHT
    }

    this.options.candleData = this.options.candleData.map(str2number)

    let { candleData } = options

    let min = d3.min(candleData, d => +d.low)
    let max = d3.max(candleData, d => +d.high)

    min = min - min / 50
    max = max + max / 50

    let scaleY = d3.scaleLinear().domain([min, max]).range([this.candleStickAreaHeight, 0])

    this.min = min
    this.max = max
    this.scaleY = scaleY
    this.render()
    // this.initZooming()
    this.initBrush()
  }

  initBrush() {
    var { width } = this.options
    var candleData = [...this.options.candleData]
    var lastIndex = candleData.length - 1
    var domain = d3.extent(candleData, d => new Date(d.time))
    var brushX = d3.scaleTime().domain(domain).range([0, width])

    var formatFunc = d3.timeFormat('%Y-%m-%d')

    // console.log(formatFunc(new Date()))

    var brush = d3.brushX()
    var self = this
    var x2 = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width])

    var brushed = function(d, i) {
      // 两种方法作用相同
      // console.log(d3.brushSelection(this))
      // console.log('selection:', d3.event.selection)

      var s = d3.event.selection
      var newDomain = s.map(value => x2.invert(value))
      var [startIndex, endIndex] = newDomain

      if (startIndex < 0 || endIndex > lastIndex) {
        return
      }

      var currentRange = candleData.slice(Math.round(newDomain[0]), Math.round(newDomain[1]) + 1)
      // 设置当前需要画的部分
      self.options.candleData = currentRange
      // 重绘蜡烛线
      self.candleSticks()
      // 重绘量线
      self.volumes()
      // 重绘数轴
      self.updateAxis()
    }

    brush.extent([
      [0, 0],
      [width, 80]
    ])

    brush.on('brush', brushed)

    // this.brushArea = d3.select(this.selector)
    //   .append('svg')
    //   .attr('display', 'block')
    //   .attr('width', width)
    //   .attr('height', 100)
    //     .append('g');

    // // extent方法，限制刷子的滑动范围，传入左上角和右下角的坐标
    // // brush.extent([[0, 0], [300, 100]])


    // this.brushArea.call(brush)

    var svg = d3.select(this.selector).append('svg')
      .attr('display', 'block')
      .attr('width', width)
      .attr('height', 100)

    var brushBar = svg.append('g')

    brushBar.call(brush).call(brush.move, [width - 100, width])

    var axis = d3.axisBottom(brushX).ticks(4).tickFormat(d => formatFunc(d))
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 80)`).call(axis)
  }

  initZooming() {
    var { svg } = this

    var zoomed = () => {
      var { transform } = d3.event

      console.log(`scale(${transform.k})`)

      this.candleGroup.attr('transform', `scale(${transform.k})`)
    }

    var zoomBehavior = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([0, 0], [this.options.width, this.candleStickAreaHeight])
      .extent([0, 0], [this.options.width, this.candleStickAreaHeight])
      .on('zoom', zoomed)

    svg.call(zoomBehavior)
  }

  // 蜡烛线
  candleSticks() {
    let { svg, scaleY } = this
    let { width, candleData } = this.options
    let height = this.candleStickAreaHeight

    if (this.candleGroup) {
      this.candleGroup.remove()
    }

    let scaleX = d3.scaleBand()
      .domain(candleData.map((o, i) => i))
      .range([0, width])
      .padding(0.4)

    this.scaleBandX = scaleX

    this.candleGroup = svg.append('g')
      .attr('class', 'candles')

    let group = this.candleGroup
    let calColor = d => {
      if (d.close > d.open) {
        return WIN_COLOR
      } else if (d.close < d.open) {
        return LOSS_COLOR
      } else {
        return EQUAL_COLOR
      }
    }

    let candleSelection = group.selectAll('rect')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', d => scaleY(Math.max(d.open, d.close)))
      .attr('width', scaleX.bandwidth())
      .attr('height', d => {
        var height = scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close))

        return (height < 1 ? 1 : height)
      })
      .attr('fill', calColor)

    let line = d3.line().x(d => d.x).y(d => d.y)

    group.selectAll('path.shadow')
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
      .attr('stroke', calColor)
  }

  // 量线
  volumes() {
    var { svg } = this
    var { width, candleData } = this.options
    var height = this.candleStickAreaHeight
    var min = d3.min(candleData, d => d.volume)
    var max = d3.max(candleData, d => d.volume)

    if (this.volGroup) {
      this.volGroup.remove()
    }

    // 增加一些
    max += max / 10

    var VOL_HEIGHT = 66
    var offset = width * PREDICT_PERCENT
    var scaleY = d3.scaleLinear().domain([min, max]).range([VOL_HEIGHT, 0])
    var group = svg.append('g').attr('transform', `translate(0, ${height + MARGIN_BOTTOM - 1})`)

    group.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', VOL_HEIGHT)
      .attr('class', 'volume')

    var scaleX = this.scaleBandX
    group.selectAll('.bar').data(candleData).enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', d => scaleY(d.volume))
      .attr('width', scaleX.bandwidth())
      .attr('height', d => VOL_HEIGHT - scaleY(d.volume))
      .attr('fill', d => d.open < d.close ? WIN_COLOR : LOSS_COLOR)

    group.selectAll('.bar').data(candleData).enter()
      .append('rect')
      .attr('class', 'bar')

    this.volGroup = group
  }

  // 数轴&辅助线
  axis() {
    var { svg, scaleY } = this
    var { width, candleData } = this.options
    var height = this.candleStickAreaHeight

    // svg.selectAll('.axis').remove()

    // var scaleXReal = d3.scaleOrdinal()
    //   .domain([candleData[0].time, candleData[candleData.length - 1].time])
    //   .range([0, width])

    var scaleX = d3.scaleTime()
      .domain([
        new Date(candleData[0].time),
        new Date(candleData[candleData.length - 1].time)
      ])
      .range([0, width])

    let { min, max } = this
    min = +min
    max = +max
    let scaleYReal = d3.scaleOrdinal()
      .domain([min, (max + min) / 2, max])
      .range([height, height / 2, 0])

    // 底部X轴
    var bottomAxis = d3.axisBottom(scaleX)
      .tickSize(0)
      .ticks(8)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => moment(d).format('YYYY-MM-DD'))

    // 右侧Y轴
    var rightAxis = d3.axisLeft(scaleYReal)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => Number(d).toFixed(2))

    // 顶部X轴（辅助线）
    var topAxis = d3.axisBottom(scaleX)
      .tickSize(this.candleStickAreaHeight)
      .ticks(8)
      .tickFormat('')

    // 左侧Y轴
    var leftAxis = d3.axisRight(scaleYReal)
      .tickSize(width)
      .tickFormat('')

    this.topAxisXElement = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, 0)`)
      .call(topAxis)

    this.leftAxisElement = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, 0)`)
      .call(leftAxis)

    this.bottomAxisXElement = svg.append('g')
      .attr('class', 'axis bottom-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis)

    this.rightAxisYElement = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${width}, 0)`)
      .call(rightAxis)

    this.bottomAxisXElement.selectAll('.tick text')
      .attr('text-anchor', 'end')

    this.rightAxisYElement.selectAll('.tick text')
      .each(function(d, i) {
        if (i == 2) {
          d3.select(this).attr('transform', `translate(0, 10)`)
        } else {
          d3.select(this).attr('transform', `translate(0, -10)`)
        }
      })
  }

  updateAxis() {
    var { svg, scaleY } = this
    var { width, candleData } = this.options
    var height = this.candleStickAreaHeight

    var scaleX = d3.scaleTime()
      .domain([
        new Date(candleData[0].time),
        new Date(candleData[candleData.length - 1].time)
      ])
      .range([0, width])

    // let { min, max } = this
    // min = +min
    // max = +max

    let min = d3.min(candleData, d => d.low)
    let max = d3.max(candleData, d => d.high)

    let scaleYReal = d3.scaleOrdinal()
      .domain([min, (max + min) / 2, max])
      .range([height, height / 2, 0])

     // 底部X轴
    var bottomAxis = d3.axisBottom(scaleX)
      .tickSize(0)
      .ticks(4)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => moment(d).format('YYYY-MM-DD'))

    // 右侧Y轴
    var rightAxis = d3.axisLeft(scaleYReal)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => Number(d).toFixed(2))

    // 顶部X轴（辅助线）
    var topAxis = d3.axisBottom(scaleX)
      .tickSize(this.candleStickAreaHeight)
      .ticks(4)
      .tickFormat('')

    // 左侧Y轴
    var leftAxis = d3.axisRight(scaleYReal)
      .tickSize(width)
      .tickFormat('')

    this.topAxisXElement.call(topAxis)

    this.leftAxisElement.call(leftAxis)

    this.bottomAxisXElement.call(bottomAxis)

    this.rightAxisYElement.call(rightAxis)

    this.bottomAxisXElement.selectAll('.tick text')
      .attr('text-anchor', 'end')

    this.rightAxisYElement.selectAll('.tick text')
      .each(function(d, i) {
        if (i == 2) {
          d3.select(this).attr('transform', `translate(0, 10)`)
        } else {
          d3.select(this).attr('transform', `translate(0, -10)`)
        }
      })
  }

  /* 显示折线 */
  drawPolyline() {
    let { candleData, width } = this.options
    let scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width * PREDICT_PERCENT])
    let scaleY = this.scaleY
    let line = d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d.close))

    let group = this.svg.append('g').attr('class', 'poly')

    group.append('path')
      .datum(candleData)
      .attr('d', line)
      .attr('stroke', '#297cda')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    this.lineGroup = group
  }

  togglePoly(bool) {
    if (!this.lineGroup) {
      this.drawPolyline()
    } else {
      this.lineGroup.attr('class', bool ? 'poly' : 'none')
    }
  }

  toggleCandle(bool) {
    this.candleGroup.attr('class', bool ? 'candle': 'none')
  }

  events() {
    var t = this
    var timer
    var interactiveEnabled = false

    this.svg.on('touchstart', function() {
      let [[x, y]] = d3.touches(this)

      timer = setTimeout(() => {
        t.handleDragStart(x, y)
        interactiveEnabled = true
      }, 500)
    })

    this.svg.on('touchmove', function() {
      if (interactiveEnabled) {
        let [[x, y]] = d3.touches(this)
        t.handleDragMove(x, y)
      } else {
        clearTimeout(timer)
      }
    })

    this.svg.on('touchend', () => {
      if (interactiveEnabled) {
        t.handleDragEnd()
      } else {
        clearTimeout(timer)
      }

      interactiveEnabled = false
    })
  }

  getHelperLineXY(x) {
    let { candleData, width } = this.options
    let { scaleBandX, scaleY, predictScaleX } = this

    let step = scaleBandX.step()
    let index = Math.floor( x / step )

    if (index < 0 || index >= candleData.length) {
      return {
        x: -1,
        y: -1,
        index
      }
    }

    let bandWidth = scaleBandX.bandwidth()
    let lineX = scaleBandX(index) + bandWidth / 2
    let lineY = scaleY(candleData[index].close)

    return { x: lineX, y: lineY, point: candleData[index] }
  }

  handleDragStart(x) {
    var {x, y, point} = this.getHelperLineXY(x)

    if (x === -1) return

    var hData = [{
      x: 0,
      y: y
    }, {
      x: this.options.width,
      y: y
    }]

    var vData = [
      {
        x: x,
        y: 0
      },
      {
        x: x,
        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
      }
    ]

    var line = d3.line().x(d => d.x).y(d => d.y)

    var horizontalLine = this.svg.append('path')
    var verticalLine = this.svg.append('path')

    horizontalLine.datum(hData).attr('d', line).attr('class', 'help')
    verticalLine.datum(vData).attr('d', line).attr('class', 'help')

    this.horizontalLine = horizontalLine
    this.verticalLine = verticalLine

    this.emit('drag-start', point)
  }

  handleDragMove(x) {
    var { x, y, point } = this.getHelperLineXY(x)

    if (x === -1) return

    var hData = [{
      x: 0,
      y: y
    }, {
      x: this.options.width,
      y: y
    }]

    var vData = [
      {
        x: x,
        y: 0
      },
      {
        x: x,
        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
      }
    ]

    var line = d3.line().x(d => d.x).y(d => d.y)

    this.horizontalLine.datum(hData).attr('d', line)
    this.verticalLine.datum(vData).attr('d', line)

    this.emit('drag-move', point)
  }

  handleDragEnd() {
    if (this.horizontalLine || this.verticalLine) {
      this.horizontalLine.remove()
      this.verticalLine.remove()
    }

    this.emit('drag-end')
  }

  render() {
    let { volume, interactive } = this.options

    this.axis()
    this.candleSticks()

    if (volume) {
      this.volumes()
    }

    if (interactive) {
      this.events()
    }
  }
}

module.exports = StockChart
