import './style.css'

const debounce = require('debounce')
const EventEmitter = require('events')
const d3 = require('d3')
const VOL_RATIO = 0.3
const BOTTOM_MARGIN = 16
const AREA_STROKE_COLOR = '#4188bb'
const AXIS_STROKE_COLOR = '#eeeeee'
const RED = '#e94f69'
const GREEN = '#139125'
const UNKNOW = '#CCCCCC'
const ORANGE = '#ec9e4a'
const TOTAL_COUNT = 661
const TIMES = ['20:00', '0:00', '9:00', '13:30', '15:30']
import getArrayBetween from './lib/getArrayBetween'
import formatMoney from './lib/formatMoney'

class TimeTrendChart extends EventEmitter {
  constructor({width, height, container, data, settlementPrice, high, low}) {
    super()
    this.element = d3.select(container)
    this.svg = this.element.append('svg')
    this.svg.attr('width', width).attr('height', height)

    this.container = container
    this.width = width
    this.height = height
    this.volHeight = height * VOL_RATIO
    this.baseHeight = height - this.volHeight - BOTTOM_MARGIN
    this.data = data
    this.settlementPrice = settlementPrice
    this.high = high
    this.low = low
    this.render()
    this.initTouchEvents()
  }

  render() {
    this.renderAxis()
    this.renderArea()
    this.renderVolumes()
  }

  renderAxis() {
    this.createHorizontalAxis()
    this.createVerticalAxis()
  }

  // 初始化事件处理
  initTouchEvents() {
    var {svg, width, height, baseHeight} = this
    var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, width])
    var line = d3.line().x(d => d.x).y(d => d.y)
    var that = this

    const TIP_PADDING = 2
    const drawLine = (data) => {
      var lines = svg.selectAll('.guide-line').data(data)

      lines.enter().append('path')
        .attr('class', 'guide-line')
        .merge(lines)
        .attr('d', line)

      lines.exit().remove()
    }

    const drawTip = (data, datum) => {
      var tips = svg.selectAll('.tip-group').data(data)

      tips.exit().remove()

      tips = tips.enter()
        .append('g')
        .attr('class', 'tip-group')
        .merge(tips)
        // .attr('transform', d => `translate(${d.x}, ${d.y})`)

      tips.selectAll('.tip-cell')
        .data([datum])
        .enter()
        .append('rect')
        .attr('class', 'tip-cell')

      tips.selectAll('.tip-text')
        .data([datum])
        .enter()
        .append('text')
        .attr('class', 'tip-text')

      tips.each(function(d, i) {
        var g = d3.select(this)
        var text

        if (i === 0) {
          text = g.select('.tip-text').text(datum.date)
        }

        if (i === 1) {
          text = g.select('.tip-text').text(datum.price)
        }

        var bbox = text.node().getBBox()

        var outerX, outerY

        // 底部
        if (i === 0) {

          outerX = d.x- (bbox.width + TIP_PADDING * 2) / 2
          outerY = d.y + bbox.height

          if (outerX < 0) outerX = 0
          if (outerX > width - bbox.width - TIP_PADDING * 2) outerX = width - bbox.width - TIP_PADDING * 2
        }
        // 左侧
        else if (i === 1) {
          outerX = d.x + 1 // 加1防止贴边
          outerY = d.y + bbox.height / 2 - TIP_PADDING

          if (outerY < 0)  outerY = 0
          if (outerY > baseHeight - bbox.height / 2)  outerY = baseHeight - bbox.height / 2
        }

        g.attr('transform', `translate(${outerX}, ${outerY})`)

        text.attr('transform', `translate(${TIP_PADDING}, 0)`)

        var rect = g.select('rect')
          .attr('x', bbox.x)
          .attr('y', bbox.y)
          .attr('width', bbox.width + TIP_PADDING * 2)
          .attr('height', bbox.height)
      })
    }

    const handleTouch = function() {
      var [[x]] = d3.touches(this)
      var index = Math.floor(scaleX.invert(x))

      if (index < 0 || index >= that.data.length) {
        return
      }

      var datum = that.data[index]
      // 更新成交量文字
      that.volumeLeftAxisElement.select('.tick text').text(`成交量:${formatMoney(datum.volume)}`)

      // 绘制辅助线
      var verticalGuideLineCoords = [{
        x: x,
        y: 0
      }, {
        x: x,
        y: height
      }]
      var y = that.areaScaleY(datum.price)
      var horizontalGuideLineCoords = [{
        x: 0,
        y: y
      }, {
        x: width,
        y: y
      }]

      // 绘制辅助线
      drawLine([verticalGuideLineCoords, horizontalGuideLineCoords])

      // 绘制悬浮框
      drawTip([
        // 底部tip坐标
        {
          x: x,
          y: baseHeight
        },
        // 左侧tip坐标
        {
          x: 0,
          y: y
        }
      ], datum)

      that.emit('change', datum)
    }

    svg.on('touchstart', handleTouch)
      .on('touchmove', handleTouch)
      .on('touchend', function() {
        drawLine([])
        drawTip([])

        that.updateVolumesYAxis()

        that.emit('change', that.data[that.data.length - 1])
      })
  }

  // 创建水平数轴
  createHorizontalAxis() {
    var { width, baseHeight, svg } = this
    var range = [0, width * 4 / 11, width * 6.5 / 11, width * 9 / 11, width]
    var scale = d3.scaleOrdinal().domain(TIMES).range(range)

    this.staticScale = scale

    var bottomAxis = d3.axisBottom(scale).tickSize(0).tickPadding(6)
    var bottomAxisElement = svg.append('g').attr('class', 'chart-axis')
      .attr('transform', `translate(0, ${baseHeight})`)
    bottomAxisElement.call(bottomAxis)

    bottomAxisElement.selectAll('.tick text')
      .attr('text-anchor', 'middle')
      .attr('transform', (d, i) => {
        if (i === TIMES.length - 1) {
          return `translate(-16, 0)`
        } else if (i === 0) {
          return `translate(15, 0)`
        }
      })

    // 辅助线
    var topAxis = d3.axisBottom(scale).tickSize(baseHeight).tickFormat('')
    svg.append('g').attr('class', 'chart-axis').attr('transform', `translate(0, 0)`).call(topAxis)
  }

  // 创建垂直数轴的刻度尺
  createScaleForAxisY() {
    // var settlementPrice = this.settlementPrice
    // var baseHeight = this.baseHeight
    // var min = this.low
    // var max = this.high
    //
    // var minus = settlementPrice - min
    //
    //
    // var domain = []
    //
    // if (settlementPrice < max) {
    //   var top = max
    //   var mid = settlementPrice
    //   var bottom = settlementPrice - (max - settlementPrice)
    // } else {
    //   var bottom = max
    //   var mid = settlementPrice
    //   var top = settlementPrice - (settlementPrice - max)
    // }
    //
    // domain = [bottom, mid, top].map(o => Number(o).toFixed(2))
    //
    // this.realMax = top
    // this.realMin = bottom
    //
    // var step = baseHeight / (domain.length - 1)
    // var range = domain.map((v, i) => step * i)
    //
    // range = range.reverse()
    //
    // var scale = d3.scaleOrdinal().domain(domain).range(range)
    //
    // return scale
    var settlementPrice = this.settlementPrice
    var baseHeight = this.baseHeight
    var min = this.low
    var max = this.high

    var diff = 0
    var mindiff = 0
    var maxdiff = 0
    if (max > settlementPrice) {
      maxdiff = max - settlementPrice
    }else{
      maxdiff = settlementPrice - max
    }
    if (min > settlementPrice) {
      mindiff = min - settlementPrice
    }else{
      mindiff = settlementPrice - min
    }
    if(maxdiff > mindiff){
      diff = maxdiff
    }else{
      diff = mindiff
    }

    var domain = []
    var top = settlementPrice + diff
    var mid = settlementPrice
    var bottom = settlementPrice - diff

    domain = [bottom, mid, top].map(o => Number(o).toFixed(2))

    console.log(domain)

    this.realMax = top
    this.realMin = bottom

    var step = baseHeight / (domain.length - 1)
    var range = domain.map((v, i) => step * i)

    range = range.reverse()

    var scale = d3.scaleOrdinal().domain(domain).range(range)

    return scale
  }

  // 创建垂直数轴
  createVerticalAxis() {
    var svg = this.svg
    var leftAxisElement = svg.append('g').attr('class', 'chart-axis')
    this.leftAxisElement = leftAxisElement
    this.updateYAxis()

    // 辅助线
    var step = this.baseHeight / 4
    var helpScale = d3.scaleOrdinal().domain([0, 1, 2, 3, 4]).range([0, step * 1, step * 2, step * 3, this.baseHeight])
    var rightAxis = d3.axisLeft(helpScale).tickSize(this.width).tickFormat('').ticks(4)
    var rightAxisElement = svg.append('g')
      .attr('class', 'chart-axis')
      .attr('transform', `translate(${this.width - 1}, 0)`)
      .call(rightAxis)

    rightAxisElement.selectAll('.tick line').attr('stroke-dasharray', (d, i) => {
      if (i == 1 || i == 3) return '10, 4'
    })
  }

  // 更新左侧Y轴刻度
  updateYAxis() {
    var scale = this.createScaleForAxisY()
    var leftAxis = d3.axisRight(scale).tickSize(0)

    this.leftAxisElement.call(leftAxis)

    // 调整刻度位置
    this.leftAxisElement.selectAll('.tick text')
      .attr('transform', (d, i, all) => {
        console.log(d, i)

        var offset = i == 0 ? -10 : 10

        return `translate(0, ${offset})`
      })
      .attr('fill', (d, i, all) => {
        if (i == 0) return RED
        if (i == all.length - 1) return GREEN
        return '#777'
      })

    return scale
  }

  // 绘制分时图
  renderArea() {
    this.svg.append('g').attr('class', 'trend-area-wrap')
    this.updateArea()
  }

  // 绘制量图
  renderVolumes() {
    this.volumeWrapper = this.svg.append('g').attr('class', 'volume-wrap')
    this.volumeWrapper.attr('transform', `translate(0, ${this.baseHeight + BOTTOM_MARGIN})`)

    // 绘制量图数轴
    // 保存方便后续更新
    this.volumeLeftAxisElement = this.volumeWrapper.append('g').attr('class', 'chart-axis')
    this.updateVolumesYAxis()

    // 量图垂直辅助线
    var axisBottom = d3.axisTop(this.staticScale).tickSize(this.volHeight - 21).tickFormat('')
    var axisBottomElement = this.volumeWrapper.append('g')
      .attr('transform', `translate(0, ${this.volHeight - 1})`)
      .attr('class', 'chart-axis')
      .call(axisBottom)

    var axisTop = d3.axisBottom(this.staticScale).tickSize(0).tickFormat('')
    var axisTopElement = this.volumeWrapper.append('g').attr('class', 'chart-axis').call(axisTop)
    this.updateVolumes()

    // 量图水平辅助线(固定)
    var min = 0
    var max = d3.max(this.data, d => d.volume)
    var scale = d3.scaleOrdinal().domain([1,2,3]).range([0, 20, this.volHeight])
    var axisLeft = d3.axisLeft(scale).tickSize(this.width)
    var axisLeftElement = this.volumeWrapper.append('g').attr('class', 'chart-axis').attr('transform', `translate(${this.width - 1}, 0)`)
      .call(axisLeft)
  }

  // 声明量图绘制过程
  updateVolumes() {
    var min = 0
    var max = d3.max(this.data, d => d.volume)
    var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, this.width])
    var scaleY = d3.scaleLinear().domain([min, max]).range([this.volHeight, 20])

    var data = this.data.map(({volume}, i) => {
      var x0 = scaleX(i)
      var y0 = scaleY(volume)

      return [{
        x: x0,
        y: y0
      }, {
        x: x0,
        y: this.volHeight
      }]
    })

    var vols = this.volumeWrapper.selectAll('.vol').data(data)
    var prices = this.data.map(o => o.price)
    var line = d3.line()
      .x(d => d.x)
      .y(d => d.y)

    vols.enter()
      .append('path')
      .attr('class', 'vol')
      .merge(vols)
      .attr('d', line)
      .attr('stroke', (d, i) => {
        if (i === 0) {
          return UNKNOW
        }

        // return prices[i] > prices[i - 1] ? RED : prices[i] == prices[i - 1] ? UNKNOW : GREEN
        return prices[i] > prices[i - 1] ? RED : GREEN
      })

    vols.exit().remove()
  }

  // 更新Y轴
  updateVolumesYAxis() {
    var min = 0
    var max = d3.max(this.data, d => d.volume)
    var curr = this.data.length > 0 ? this.data[this.data.length - 1].volume: 0

    var scale = d3.scaleOrdinal().domain([
      `成交量:${formatMoney(curr)}`,
      formatMoney(max),
      0]).range([0, 20, this.volHeight])

    var axis = d3.axisRight(scale).tickSize(0)
    this.volumeLeftAxisElement.call(axis)

    this.volumeLeftAxisElement.selectAll('.tick text')
      .attr('transform', `translate(0, 10)`)
      .attr('fill', ORANGE)
  }

  // 声明分时绘制过程
  updateArea() {
    var baseHeight = this.baseHeight
    var svg = this.svg
    // var min = d3.min(this.data, d => d.price)
    // var max = d3.max(this.data, d => d.price)

    var min = this.realMin
    var max = this.realMax

    var { baseHeight, svg, width, data } = this

    var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, width])
    var scaleY = d3.scaleLinear().domain([min, max]).range([baseHeight, 0])
    var areaElement = this.svg.select('.trend-area-wrap')

    var line = d3.line()
      .x((d, i) => scaleX(i))
      .y((d, i) => scaleY(d.price))

    var area = d3.area()
      .x((d, i) => scaleX(i))
      .y0((d, i) => scaleY(d.price))
      .y1(baseHeight)

    var trendLine = areaElement.selectAll('.trend-line').data([data])

    trendLine.exit().remove()

    trendLine.enter()
      .append('path')
      .attr('class', 'trend-line')
      .merge(trendLine)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', AREA_STROKE_COLOR)

    var trendArea = areaElement.selectAll('.trend-area').data([data])

    trendArea.exit().remove()

    trendArea.enter()
      .append('path')
      .attr('class', 'trend-area')
      .merge(trendArea)
      .attr('d', area)
      .attr('fill', AREA_STROKE_COLOR)
      .attr('opacity', '0.3')

    this.areaScaleX = scaleX
    this.areaScaleY = scaleY

    this.updateAverage()
  }

  updateAverage() {
    var svg = this.svg
    var scaleX = this.areaScaleX
    var scaleY = this.areaScaleY

    var line = d3.line()
      .x((d, i) => scaleX(i))
      .y((d, i) => scaleY(d.average))

    var areaElement = this.svg.select('.trend-area-wrap')

    var maLine = areaElement.selectAll('.ma').data([this.data])
    maLine.exit().remove()
    maLine.enter()
      .append('path')
      .attr('class', 'ma')
      .merge(maLine)
      .attr('d', line)
  }

  update(data) {
    this.data = data
    this.updateArea()
    this.updateYAxis()

    this.updateVolumes()
    this.updateVolumesYAxis()
  }
}

module.exports = TimeTrendChart