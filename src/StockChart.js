/**
 * Created by shinan on 2017/1/22.
 */
const d3 = require('d3')
import {WIN_COLOR, LOSS_COLOR, EQUAL_COLOR} from './libs/config'
import './css/stock-chart.css'
const str2number = require('./libs/str2number')
const PREDICT_PERCENT = 0.7
const MARGIN_BOTTOM = 15
const MARGIN_RIGHT = 1
const TEXT_MARGIN = 5
const VOL_HEIGHT = 66
const EventEmitter = require('events')
const moment = require('moment')
const AREA_MARGIN = 5

const calColor = d => {
  if (d.close > d.open) {
    return WIN_COLOR
  } else if (d.close < d.open) {
    return LOSS_COLOR
  } else {
    return EQUAL_COLOR
  }
}

class StockChart extends EventEmitter {
  constructor(selector, options) {
    super(selector, options)
    this.selector = selector
    this.options = options
    this.element = d3.select(selector)

    this.svg = this.element
      .append('svg')
      .attr('width', options.width)
      .attr('height', options.height)

    this.volAreaHeight = 66
    this.overviewAreaHeight = 66
    this.macdAreaHeight = 66

    this.totalHeight = this.options.height
    this.candleStickAreaHeight = options.height - MARGIN_BOTTOM
    this.options.width = options.width - MARGIN_RIGHT

    if (this.options.volume) {
      this.candleStickAreaHeight -= VOL_HEIGHT
    }
    this.options.candleData = this.options.candleData.map(str2number)
    this.render()
  }

  renderOverviewArea() {
    var { width, height } = this.options
    var container = this.element.append('svg').attr('height', this.overviewAreaHeight + 1).attr('width', width + MARGIN_RIGHT)
    var candleData = this.options.candleData
    var min = d3.min(candleData, d => d.close)
    var max = d3.max(candleData, d => d.close)
    var scaleY = d3.scaleLinear().domain([min, max]).range([this.overviewAreaHeight, 10])
    var scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, this.options.width])

    var line = d3.line()
      .x((d, i) => scaleX(i))
      .y(d => scaleY(d.close))

    /*
     * y0 和 y1 可以分別看成是上方 y 座標與下方 y 坐標，
     * x0 和 x1 可以看成左方的 x 座標與右方的 x 座標，
     * 基本上一定要有 x 一組數據搭配 y0、y1 或 y 一組數據搭配 x0、x1，
     * 因此最重要的其實就是必須要有一組座標來產生 area
     */

    var area = d3.area()
      .x((d, i) => scaleX(i))
      .y0(d => scaleY(d.close))
      .y1(this.overviewAreaHeight)
    // 绘制区域图形
    container.append('path').datum(candleData).attr('d', line).attr('fill', 'none').attr('stroke', '#ccc')
    container.append('path').datum(candleData).attr('d', area).attr('fill', '#ccc').attr('opacity', '0.3')

    // 数轴使用的比例尺
    var domain = [candleData[0].time]
    var len = candleData.length
    for (var i = 1; i < 5; i++) {
      var index = Math.floor(len * 0.2 * i) - 1
      domain.push(candleData[index].time)
    }

    var range = this.getArrayBetween(0, width, 4)
    var scaleForAxis = d3.scaleOrdinal().domain(domain).range(range)
    var axisBottom = d3.axisTop(scaleForAxis).tickSize(0)
    var axisTop = d3.axisBottom(scaleForAxis).tickSize(this.overviewAreaHeight).tickFormat('')
    var axisBottomElement = container.append('g').attr('class', 'axis').attr('transform', `translate(0, ${this.overviewAreaHeight})`).call(axisBottom)

    // 文字位置微调
    axisBottomElement.selectAll('.tick text').attr('text-anchor', 'start').each(function(d, i) {
      d3.select(this).attr('transform', 'translate(2, 0)')
    })

    var lastTick = axisBottomElement.select('.tick:last-child')
    lastTick.remove()

    // 顶部做辅助线
    container.append('g').attr('class', 'axis').call(axisTop)

    this.overviewArea = container
  }

  initBrush() {
    var {width} = this.options
    var candleData = [ ...this.options.candleData ]
    var lastIndex = candleData.length - 1
    var domain = d3.extent(candleData, d => new Date(d.time))
    var brushX = d3.scaleTime().domain(domain).range([0, width])
    var formatFunc = d3.timeFormat('%Y-%m-%d')

    var brush = d3.brushX()
    var self = this
    var x2 = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width])

    var brushed = function (d, i) {
      // 下面两种写法作用相同
      // console.log(d3.brushSelection(this))
      // console.log('selection:', d3.event.selection)

      var s = d3.event.selection

      // console.log(s[1] - s[0])

      if (s[1] - s[0] < 50) {
        return
      }

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
      self.updateVolumes()
      // 重绘数轴
      self.updateAxis()
      // 重绘MACD
      self.updateMacdArea()
    }

    brush.extent([
      [0, 0],
      [width, this.overviewAreaHeight]
    ])

    brush.on('brush end', brushed)

    // this.brushArea = d3.select(this.selector)
    //   .append('svg')
    //   .attr('display', 'block')
    //   .attr('width', width)
    //   .attr('height', 100)
    //     .append('g');

    // // extent方法，限制刷子的滑动范围，传入左上角和右下角的坐标
    // // brush.extent([[0, 0], [300, 100]])


    // this.brushArea.call(brush)


    var overview = this.overviewArea
    var brushBar = overview.append('g')

    brushBar.call(brush).call(brush.move, [width - 100, width])
  }

  initZooming() {
    var { svg } = this

    var zoomed = () => {
      var { transform } = d3.event

      // console.log(`scale(${transform.k})`)

      this.candleGroup.attr('transform', `scale(${transform.k})`)
    }

    var zoomBehavior = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([0, 0], [this.options.width, this.candleStickAreaHeight])
      .extent([0, 0], [this.options.width, this.candleStickAreaHeight])
      .on('zoom', zoomed)

    svg.call(zoomBehavior)
  }

  calculateMinAndMax() {
    var { candleData } = this.options
    var min = d3.min(candleData, function(d) {
      return Math.min(d.low, d.ma5, d.ma10, d.ma20, d.ma30)
    })

    var max = d3.max(candleData, function(d) {
      return Math.max(d.high, d.ma5, d.ma10, d.ma20, d.ma30)
    })

    return { min, max }
  }

  // 蜡烛线
  candleSticks() {
    let { svg } = this
    let {width, candleData} = this.options
    let height = this.candleStickAreaHeight

    if (this.candleGroup) {
      this.candleGroup.remove()
    }

    let { min, max } = this.calculateMinAndMax()

    let scaleX = d3.scaleBand()
      .domain(candleData.map((o, i) => i))
      .range([0, width])
      .padding(0.3)

    const margin = 8
    let scaleY = d3.scaleLinear().domain([min, max]).range([this.candleStickAreaHeight - margin, 0 + margin])

    this.scaleBandX = scaleX
    this.candleGroup = svg.append('g').attr('class', 'candles')

    let group = this.candleGroup
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

    this.paintShadowLines(group, scaleX, scaleY)
    this.paintAverageLines(group, scaleY)
  }

  paintShadowLines(group, scaleX, scaleY) {
    let { candleData } = this.options
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

  paintAverageLines(group, scaleY) {
    let { candleData, width } = this.options
    let scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width])
    let line = (key) => d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d[key]))
    let mas = ['ma5', 'ma10', 'ma20', 'ma30']

    mas.forEach(function(prop) {
      group.append('path')
        .datum(candleData)
        .attr('class', prop)
        .attr('d', line(prop))
    })
  }

  // MACD DEA DIF
  paintMacdArea() {
    var { width, height, candleData } = this.options
    var group = this.element.append('svg').attr('width', width + 1).attr('height', this.macdAreaHeight + 1).attr('class', 'macd-container')

    var min = d3.min(candleData, d => Math.min(d.macd, d.dif, d.dea))
    var max = d3.max(candleData, d => Math.max(d.macd, d.dif, d.dea))

    var domainY = [min, 0, max]
    var rangeY = [this.macdAreaHeight, this.macdAreaHeight / 2, 0]
    var scaleY = d3.scaleLinear().domain(domainY).range(rangeY)
    var scaleX = d3.scalePoint().range([0, width]).padding(0.2)

    var line = d3.line().x(d => d.x).y(d => d.y)

    group.append('rect').attr('width', width).attr('height', this.macdAreaHeight).attr('stroke', '#ccc').attr('fill', 'none')

    group.append('path').attr('d', () => {
      var x1 = 0
      var x2 = width
      var y1 = this.macdAreaHeight / 2
      var y2 = y1

      return line([{x: x1, y: y1}, {x: x2, y: y2}])
    }).attr('stroke', '#ccc')

    // 绘制macd
    scaleX.domain(candleData.map((item, index) => index))
    group.selectAll('.macd')
      .data(candleData)
      .enter()
      .append('path')
      .attr('class', 'macd')
      .attr('d', (d, i) => {
        var x1 = scaleX(i)
        var x2 = x1
        var y1 = scaleY(d.macd)
        var y2 = scaleY(0)

        return line([{x: x1, y: y1}, {x: x2, y: y2}])
      })
      .attr('stroke', d => {
        return d.macd > 0 ? WIN_COLOR : LOSS_COLOR
      })

    // 绘制dif，dea曲线
    var scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width])
    var line = prop => d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d[prop]))

    group.append('path').datum(candleData).attr('d', line('dif')).attr('class', 'dif')
    group.append('path').datum(candleData).attr('d', line('dea')).attr('class', 'dea')


    this.macdGroup = group
  }

  // update MACD DEA DIF
  updateMacdArea() {
    var { svg } = this
    var { width, height, candleData } = this.options

    this.macdGroup.selectAll('.macd, .dif, .dea').remove()
    var min = d3.min(candleData, d => Math.min(d.macd, d.dif, d.dea))
    var max = d3.max(candleData, d => Math.max(d.macd, d.dif, d.dea))

    var domainY = [min, 0, max]
    var rangeY = [this.macdAreaHeight, this.macdAreaHeight / 2, 0]
    var scaleY = d3.scaleLinear().domain(domainY).range(rangeY)
    var scaleX = d3.scalePoint().domain(candleData.map((item, index) => index)).range([0, width]).padding(0.2)

    var line = d3.line().x(d => d.x).y(d => d.y)
    var group = this.macdGroup

    group.selectAll('.macd')
      .data(candleData)
      .enter()
      .append('path')
      .attr('class', 'macd')
      .attr('d', (d, i) => {
        var x1 = scaleX(i)
        var x2 = x1
        var y1 = scaleY(d.macd)
        var y2 = scaleY(0)

        return line([{x: x1, y: y1}, {x: x2, y: y2}])
      })
      .attr('stroke', d => {
        return d.macd > 0 ? WIN_COLOR : LOSS_COLOR
      })

    // 绘制dif，dea曲线
    var scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width])
    var line = prop => d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d[prop]))

    group.append('path').datum(candleData).attr('d', line('dif')).attr('class', 'dif')
    group.append('path').datum(candleData).attr('d', line('dea')).attr('class', 'dea')
  }

  // 量线
  volumes() {
    var { svg } = this
    var {width, candleData} = this.options
    var height = this.candleStickAreaHeight
    var min = d3.min(candleData, d => d.volume)
    var max = d3.max(candleData, d => d.volume)

    var offset = width * PREDICT_PERCENT
    var scaleY = d3.scaleLinear().domain([min, max]).range([VOL_HEIGHT, 10])
    var group = svg.append('g').attr('transform', `translate(0, ${height + MARGIN_BOTTOM - 1})`)
    var line = d3.line().x(d => d.x + 0.5).y(d => d.y + 0.5)

    group.append('path').datum([{x: 0, y: VOL_HEIGHT / 2}, {x: width, y: VOL_HEIGHT / 2}])
      .attr('d', line).attr('stroke', '#ccc')

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

    this.volGroup = group
  }

  updateVolumes() {
    var {svg} = this
    var {width, candleData} = this.options
    var height = this.candleStickAreaHeight
    var min = d3.min(candleData, d => d.volume)
    var max = d3.max(candleData, d => d.volume)

    var VOL_HEIGHT = 66
    var offset = width * PREDICT_PERCENT
    var scaleY = d3.scaleLinear().domain([min, max]).range([VOL_HEIGHT, 10])

    var group = this.volGroup
    group.selectAll('.bar').remove()

    var scaleX = this.scaleBandX
    group.selectAll('.bar').data(candleData).enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', d => scaleY(d.volume))
      .attr('width', scaleX.bandwidth())
      .attr('height', d => VOL_HEIGHT - scaleY(d.volume))
      .attr('fill', d => d.open < d.close ? WIN_COLOR : LOSS_COLOR)
  }

  // (1, 3, 2) => [1, 2, 3]
  getArrayBetween(startValue, endValue, length) {
    var interpolater = d3.interpolateNumber(startValue, endValue)
    var result = []
    for (var i = 0; i <= length; i++) {
      result.push(interpolater(i / length))
    }

    return result
  }

  createHorizontalAxis() {
    var svg = this.svg
    var { width, candleData }  = this.options
    var height = this.candleStickAreaHeight

    var domain = [candleData[0].time]

    for (var i = 1; i < 4; i++) {
      var index = Math.floor(candleData.length * (0.25 * i)) - 1
      domain.push(candleData[index].time)
    }

    domain.push(candleData[candleData.length - 1].time)

    var range = this.getArrayBetween(0, width, 4)
    var scaleX = d3.scaleOrdinal().domain(domain).range(range)
    // 创建底部的X轴
    var bottomAxis = d3.axisBottom(scaleX).tickSize(0).tickPadding(TEXT_MARGIN);
    this.bottomAxisXElement = svg.append('g').attr('class', 'axis bottom-axis').attr('transform', `translate(0, ${height})`);
    this.bottomAxisXElement.call(bottomAxis);

    // 创建辅助线
    var topAxis = d3.axisBottom(scaleX).tickSize(height).tickFormat('')
    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, 0)').call(topAxis)
  }

  // 创建垂直方向的数轴和辅助线
  createVerticalAxis() {
    let { width, candleData } = this.options
    let height = this.candleStickAreaHeight
    let {min, max} = this.calculateMinAndMax()

    let svg = this.svg
    let domain = this.getArrayBetween(min, max, 4)
    let range = this.getArrayBetween(height, 0, 4)
    let scale = d3.scaleOrdinal().domain(domain).range(range)

    let rightAxis = d3.axisLeft(scale)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => Number(d).toFixed(2));
    // 数轴
    this.rightAxisYElement = svg.append('g').attr('class', 'axis').attr('transform', `translate(${width}, 0)`).call(rightAxis);
    // 辅助线
    var leftAxis = d3.axisRight(scale).tickSize(width).tickFormat('');
    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, 0)').call(leftAxis);

    // 对刻度显示做调整
    this.repositionTicksBottom()
    this.repositionTicksRight()
  }

  repositionTicksRight() {
    this.rightAxisYElement.selectAll('.tick text')
      .each(function(d, i) {
        var element = d3.select(this)
        var translateString = `translate(0, ${ i == 0 ? -10 : 10 })`

        element.attr('transform', translateString)
      })
  }

  repositionTicksBottom() {
    this.bottomAxisXElement.selectAll('.tick text')
      .attr('text-anchor', 'start').each(function(d, i) {
        var element = d3.select(this)
        element.attr('transform', 'translate(2, 0)')
      })

    var lastTick = this.bottomAxisXElement.select('.tick:last-child')
    lastTick.remove()
  }

  updateAxis() {
    // 更新右侧数轴
    this.updateRightAxis()

    // 更新底部数轴
    this.updateBottomAxis()
  }

  // 更新数轴Y
  updateRightAxis() {
    let { candleData } = this.options
    let height = this.candleStickAreaHeight
    let min = d3.min(candleData, d => Number(d.low))
    let max = d3.max(candleData, d => Number(d.high))
    let domain = this.getArrayBetween(min, max, 4)
    let range = this.getArrayBetween(height, 0, 4)
    let scale = d3.scaleOrdinal().domain(domain).range(range)

    let rightAxis = d3.axisLeft(scale)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => Number(d).toFixed(2));

    this.rightAxisYElement.call(rightAxis)
    this.repositionTicksRight()
  }

  // 更新数轴X
  updateBottomAxis() {
    var { width, candleData }  = this.options

    var domain = [candleData[0].time]
    for (let i = 1; i < 4; i++) {
      let index = Math.floor(candleData.length * (0.25 * i)) - 1

      domain.push(candleData[index].time)
    }
    domain.push(candleData[candleData.length - 1].time)

    var range = this.getArrayBetween(0, width, 4);
    var scaleX = d3.scaleOrdinal().domain(domain).range(range);
    var bottomAxis = d3.axisBottom(scaleX).tickSize(0).tickPadding(TEXT_MARGIN);

    this.bottomAxisXElement.call(bottomAxis)
    this.repositionTicksBottom()
  }

  // 绘制数轴
  axis() {
    this.createHorizontalAxis()
    this.createVerticalAxis()
  }

  /* 显示折线 */
  // drawPolyline() {
  //   let {candleData, width} = this.options
  //   let scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width * PREDICT_PERCENT])
  //   let scaleY = this.scaleY
  //   let line = d3.line().x((d, i) => scaleX(i)).y(d => scaleY(d.close))
  //
  //   let group = this.svg.append('g').attr('class', 'poly')
  //
  //   group.append('path')
  //     .datum(candleData)
  //     .attr('d', line)
  //     .attr('stroke', '#297cda')
  //     .attr('stroke-width', 2)
  //     .attr('fill', 'none')
  //
  //   this.lineGroup = group
  // }
  //
  // togglePoly(bool) {
  //   if (!this.lineGroup) {
  //     this.drawPolyline()
  //   } else {
  //     this.lineGroup.attr('class', bool ? 'poly' : 'none')
  //   }
  // }
  //
  // toggleCandle(bool) {
  //   this.candleGroup.attr('class', bool ? 'candle' : 'none')
  // }

  events() {
    var { candleData } = this.options;
    var self = this;

    this.svg
      .on('mouseenter', function() {
        let [ x, y ] = d3.mouse(this);
        let { min, max } = self.calculateMinAndMax();
        self.currentScaleY = d3.scaleLinear().domain([min, max]).range([self.candleStickAreaHeight, 0]);
        self.handleDragStart(x, y);
      })
      .on('mousemove', function() {
        let [x, y] = d3.mouse(this);
        self.handleDragMove(x, y);
      })
      .on('mouseleave', function() {
        self.handleDragEnd();
      })
  }

  eventsMobile() {
    var t = this
    var timer
    var interactiveEnabled = false

    this.svg.on('touchstart', function () {
      let [[x, y]] = d3.touches(this)

      timer = setTimeout(() => {
        t.handleDragStart(x, y)
        interactiveEnabled = true
      }, 500)
    })

    this.svg.on('touchmove', function () {
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
    let len = candleData.length
    let { scaleBandX, currentScaleY } = this
    let step = scaleBandX.step()
    let index = Math.floor(x / step)

    if (index < 0) {
      index = 0
    }

    if (index > len - 1) {
      index = len - 1
    }

    let bandWidth = scaleBandX.bandwidth()
    let lineX = scaleBandX(index) + bandWidth / 2
    let lineY = currentScaleY(candleData[index].close)

    lineX = Math.round(lineX) + 0.5
    lineY = Math.round(lineY) + 0.5

    this.lastIndex = index

    return {x: lineX, y: lineY, point: candleData[index]}
  }

  handleDragStart(x) {
    var {x, y, point} = this.getHelperLineXY(x);

    var hData = [
      {
        x: 0,
        y: y
      }, {
        x: this.options.width,
        y: y
      }
    ];

    var vData = [
      {
        x: x,
        y: 0
      },
      {
        x: x,
        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
      }
    ];

    var line = d3.line().x(d => d.x).y(d => d.y);
    var horizontalLine = this.svg.append('path');
    var verticalLine = this.svg.append('path');

    horizontalLine.datum(hData).attr('d', line).attr('class', 'help');
    verticalLine.datum(vData).attr('d', line).attr('class', 'help');

    this.horizontalLine = horizontalLine;
    this.verticalLine = verticalLine;

    this.emit('drag-start', point);
  }

  handleDragMove(x) {
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
    this.paintMacdArea()
    this.renderOverviewArea()
    this.initBrush()
  }
}

module.exports = StockChart;