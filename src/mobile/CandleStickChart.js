/**
 * Created by 99171 on 2017/3/16.
 */
import './style.css'

const d3 = require('d3')
const EventEmitter = require('events')
const VOL_RATIO = 0.3
const BOTTOM_MARGIN = 16
const RED = '#e94f69'
const GREEN = '#139125'
const UNKNOW = '#CCCCCC'
const ORANGE = '#ec9e4a'
import getArrayBetween from './lib/getArrayBetween'
import formatMoney from './lib/formatMoney'

const color = d => {
  return d.close > d.open ? RED : GREEN
}

class CandleStickChart extends EventEmitter {
  constructor({width, height, container, data}) {
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
    this.render()
    this.initTouchEvents()
  }

  render() {
    this.renderAxis()

    this.renderCandleStick()
    this.renderAverageLines()
    this.renderVolumes()
  }

  // 绘制均线
  renderAverageLines() {
    var svg = this.svg
    var scaleY = this.areaScaleY
    var scaleX = d3.scaleLinear().domain([0, this.data.length - 1]).range([0, this.width])
    var types = ['ma5', 'ma10', 'ma20', 'ma60']

    var line = d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d))

    for (var i = 0; i < types.length; i++) {
      var prop = types[i]
      var lines = svg.selectAll(`.${prop}`).data([this.data.map(d => d[prop])])

      lines.enter()
        .append('path')
        .attr('class', prop)
        .merge(lines)
        .attr('d', line)

      lines.exit().remove()
    }
  }

  // 初始化触摸事件
  initTouchEvents() {
    var {svg, width, height, baseHeight} = this
    var self = this
    var line = d3.line().x(d => d.x).y(d => d.y)

    const drawLine = (data) => {
      var lines = svg.selectAll('.guide-line').data(data)

      lines.enter().append('path')
        .attr('class', 'guide-line')
        .merge(lines)
        .attr('d', line)

      lines.exit().remove()
    }
    const TIP_PADDING = 2
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
          text = g.select('.tip-text').text(datum.close)
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
      var {barScale} = self
      var eachBand = barScale.step()
      var bandWidth = barScale.bandwidth()
      var index = Math.round(x / eachBand)

      if (index < 0 || index >= self.data.length) {
        return
      }

      var datum = self.data[index]

      x = barScale(index) + bandWidth / 2

      var verticalGuideLineCoords = [{
        x: x,
        y: 0
      }, {
        x: x,
        y: height
      }]

      var y = self.areaScaleY(datum.close)
      var horizontalGuideLineCoords = [{
        x: 0,
        y: y
      }, {
        x: width,
        y: y
      }]

      var data = [verticalGuideLineCoords, horizontalGuideLineCoords]
      // 绘制辅助线
      drawLine(data)
      // 绘制悬浮框
      drawTip([
        {
          x: x,
          y: baseHeight
        },
        {
          x: 0,
          y: y
        }
      ], datum)

      self.axisLeftElement.select('.tick text').text(`VOL:${formatMoney(datum.volume)}`)

      self.emit('change', self.data[index])
    }

    svg.on('touchstart', handleTouch)
      .on('touchmove', handleTouch)
      .on('touchend', function() {
        drawLine([])
        drawTip([], null)

        self.updateVolumeLeftAxis()
      })
  }

  // 绘制坐标轴
  renderAxis() {
    this.createHorizontalAxis()
    this.createVerticalAxis()
  }

  // 绘制水平方向的坐标和辅助线
  createHorizontalAxis() {
    var {width, baseHeight, svg, data} = this
    var bottomAxis = this.createBottomTickAxis()
    var bottomAxisElement = this.bottomAxisElement = svg.append('g').attr('class', 'chart-axis')
      .attr('transform', `translate(0, ${baseHeight})`)

    this.updateCandleAreaBottomAxis()

    // 辅助线 从顶部伸出
    var step = width / 4
    var scale = d3.scaleOrdinal().domain([0, 1, 2, 3, 4]).range([0, step * 1, step * 2, step * 3, width - 1])
    var topAxis = d3.axisBottom(scale).tickSize(baseHeight).tickFormat('')

    // 保存该比例尺 画量图辅助线时使用
    this.verticalGuideScale = scale

    svg.append('g').attr('class', 'chart-axis').call(topAxis)
      .selectAll('.tick line').attr('stroke-dasharray', (d, i) => {
      if (i == 1 || i == 3) return '10, 4'
    })
  }

  // 绘制垂直方向的坐标和辅助线
  createVerticalAxis() {
    var {svg, baseHeight, data, width} = this

    var leftAxisElement = this.leftAxisElement = svg.append('g').attr('class', 'chart-axis')

    this.updateCandleAreaLeftAxis()

    // 辅助线 从右侧伸出
    var rangeRight = getArrayBetween(baseHeight, 0, 4)
    var scaleRight = d3.scaleOrdinal().domain(rangeRight).range(rangeRight)
    var rightAxis = d3.axisLeft(scaleRight).tickSize(width).tickFormat('')

    svg.append('g').attr('class', 'chart-axis').attr('transform', `translate(${width - 1}, 0)`).call(rightAxis)
      .selectAll('.tick line').attr('stroke-dasharray', (d, i) => {
      if (i == 1 || i == 3) return '10, 4'
    })
  }

  // 更新需要更新的坐标轴
  updateAxis() {
    this.updateCandleAreaBottomAxis()
    this.updateCandleAreaLeftAxis()
    this.updateVolumeLeftAxis()
  }

  // 生成蜡烛图左侧的坐标轴对象
  createLeftTickAxis() {
    var {baseHeight, data} = this
    var min = d3.min(data, d => d.low)
    var max = d3.max(data, d => d.high)

    var domain = [min, max]
    var range = [baseHeight, 0]

    var scale = d3.scaleOrdinal().domain(domain).range(range)
    var leftAxis = d3.axisRight(scale).tickSize(0)

    return leftAxis
  }

  // 绘制蜡烛图左侧的坐标轴
  updateCandleAreaLeftAxis() {
    this.leftAxisElement.call(this.createLeftTickAxis())
    this.leftAxisElement.selectAll('.tick text')
      .attr('transform', (d, i) => `translate(0, ${i == 0 ? -10 : 10})`)
      .attr('fill', (d, i) => i == 1 ? RED : GREEN)
  }

  // 生成蜡烛图底部的坐标轴对象
  createBottomTickAxis() {
    var {width, data} = this
    var length = data.length
    var domain = [data[0].date, length > 1 ? data[length - 1].date : '']
    var range = [0, width]
    var scale = d3.scaleOrdinal().domain(domain).range(range)
    var bottomAxis = d3.axisBottom(scale).tickSize(0).tickPadding(6)

    return bottomAxis
  }

  // 绘制蜡烛图底部的坐标轴
  updateCandleAreaBottomAxis() {
    this.bottomAxisElement.call(this.createBottomTickAxis())
    this.bottomAxisElement.selectAll('.tick text')
      .attr('text-anchor', (d, i) => i == 0 ? 'start' : 'end')
  }

  // 绘制蜡烛图实体和影线
  renderCandleStick() {
    var {svg, width, data, baseHeight} = this
    var scaleX = d3.scaleBand()
      .domain(data.map((d, i) => i))
      .range([0, width])
      .padding(0.4)

    var bandWidth = parseInt(scaleX.bandwidth())

    var min = d3.min(data, d => {
      return d3.min([d.low, d.ma5, d.ma10, d.ma20, d.ma60])
    })

    var max = d3.max(data, d => {
      return d3.max([d.high, d.ma5, d.ma10, d.ma20, d.ma60])
    })

    var scaleY = d3.scaleLinear().domain([min, max]).range([baseHeight, 10])

    this.areaScaleY = scaleY
    this.barScale = scaleX

    // 实体
    var candles = svg.selectAll('.candle').data(data)

    candles.enter()
      .append('rect')
      .attr('class', 'candle')
      .merge(candles)
      .attr('x', (d, i) => scaleX(i))
      .attr('y', (d, i) => scaleY(Math.max(d.open, d.close)))
      .attr('width', bandWidth)
      .attr('height', d => {
        var h = scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close))

        if (h < 1) {
          h = 1
        }

        return h
      })
      .attr('fill', color)

    candles.exit().remove()

    // 影线
    var line = d3.line().x(d => d.x).y(d => d.y)
    var shadows = svg.selectAll('.shadow').data(data)

    shadows.enter()
      .append('path')
      .attr('class', 'shadow')
      .merge(shadows)
      .attr('d', (d, i) => {
        var x = scaleX(i) + bandWidth / 2
        var y1 = scaleY(d.high)
        var y2 = scaleY(d.low)

        return line([{
          x: x, y: y1
        }, {
          x: x, y: y2
        }])
      })
      .attr('stroke', color)

    shadows.exit().remove()
  }

  // 绘制量图左侧纵坐标
  updateVolumeLeftAxis() {
    var {volHeight, data} = this
    var min = 0
    var max = d3.max(data, d => d.volume)
    var curr = data.length > 0 ? data[data.length - 1].volume : 0
    var scale = d3.scaleOrdinal().domain([`VOL:${formatMoney(curr)}`, formatMoney(max), 0]).range([0, 20, volHeight])
    var axisLeft = d3.axisRight(scale).tickSize(0)

    this.axisLeftElement.call(axisLeft)

    this.axisLeftElement.selectAll('.tick text')
      .attr('transform', (d, i) => `translate(0, ${i == 2 ? -10 : 10})`)
  }

  // 绘制量图
  renderVolumes() {
    var {svg, baseHeight, volHeight, width, data} = this
    var volumeWrapper = svg.append('g').attr('class', 'volume-wrap')
    volumeWrapper.attr('transform', `translate(0, ${baseHeight + BOTTOM_MARGIN})`)

    this.volumeWrapper = volumeWrapper

    // 量柱绘制
    this.renderVolumeBars()

    // 垂直坐标轴 左边刻度开始
    var axisLeftElement = this.axisLeftElement = volumeWrapper.append('g').attr('class', 'chart-axis')
    this.updateVolumeLeftAxis()

    // 垂直坐标轴 右边辅助线开始
    var scale = d3.scaleOrdinal().domain([1, 2, 3]).range([0, 19, volHeight])
    volumeWrapper.append('g').attr('class', 'chart-axis')
      .attr('transform', `translate(${width - 1}, 0)`)
      .call(d3.axisLeft(scale).tickSize(width).tickFormat(''))

    // 水平坐标轴 底部伸出辅助线
    volumeWrapper.append('g').attr('class', 'chart-axis')
      .attr('transform', `translate(0, ${volHeight - 1})`)
      .call(d3.axisTop(this.verticalGuideScale).tickSize(volHeight - 20).tickFormat(''))
  }

  // 量柱绘制
  renderVolumeBars() {
    var {svg, baseHeight, volHeight, data} = this
    var min = 0
    var max = d3.max(data, d => d.volume)

    var scaleY = d3.scaleLinear().domain([min, max]).range([volHeight, 20])
    var bars = this.volumeWrapper.selectAll('.volume').data(data)
    var barwidth = this.barScale.bandwidth()

    bars.enter().append('rect')
      .attr('class', 'volume')
      .merge(bars)
      .attr('x', (d, i) => {
        return this.barScale(i)
      })
      .attr('y', (d, i) => {
        return scaleY(d.volume)
      })
      .attr('width', barwidth)
      .attr('height', (d, i) => {
        return volHeight - scaleY(d.volume)
      })
      .attr('fill', color)

    bars.exit().remove()
  }

  // 更新
  update(data) {
    this.data = data
    this.renderCandleStick()
    this.renderAverageLines()
    this.renderVolumeBars()
    this.updateAxis()
  }
}

module.exports = CandleStickChart