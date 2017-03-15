import './style.css'

const d3 = require('d3')
const VOL_RATIO = 0.3
const BOTTOM_MARGIN = 16
const AREA_STROKE_COLOR = '#4188bb'
const AXIS_STROKE_COLOR = '#eeeeee'
const RED = '#e94f69'
const GREEN = '#139125'
const UNKNOW = '#CCCCCC'
const TIMES = ['20:00', '0:00', '9:00', '13:30', '15:30']

const getArrayBetween = (startValue, endValue, length) => {
  var interpolater = d3.interpolateNumber(startValue, endValue)
  var result = []
  for (var i = 0; i <= length; i++) {
    result.push(interpolater(i / length))
  }

  return result
}

class TimeTrendChart {
  constructor({width, height, container, data}) {
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

  // 创建水平数轴
  createHorizontalAxis() {
    var baseHeight = this.baseHeight
    var { width, svg } = this
    var range = [0, width * 4 / 11, width * 6.5 / 11, width * 9 / 11, width]
    var scale = d3.scaleOrdinal().domain(TIMES).range(range)

    this.staticScale = scale

    var bottomAxis = d3.axisBottom(scale).tickSize(0).tickPadding(6)
    var bottomAxisElement = svg.append('g').attr('class', 'axis')
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
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0, 0)`).call(topAxis)
  }

  // 创建垂直数轴的刻度尺
  createScaleForAxisY() {
    var baseHeight = this.baseHeight
    var min = d3.min(this.data.prices)
    var max = d3.max(this.data.prices)

    var domain = getArrayBetween(min, max, 2)
    var step = baseHeight / (domain.length - 1)
    var range = domain.map((v, i) => step * i)
    var scale = d3.scaleOrdinal().domain(domain.reverse()).range(range)

    return scale
  }

  // 创建垂直数轴
  createVerticalAxis() {
    var svg = this.svg
    var leftAxisElement = svg.append('g').attr('class', 'axis')
    this.leftAxisElement = leftAxisElement
    this.updateYAxis()

    // 辅助线
    var step = this.baseHeight / 4
    var helpScale = d3.scaleOrdinal().domain([0, 1, 2, 3, 4]).range([0, step * 1, step * 2, step * 3, this.baseHeight])
    var rightAxis = d3.axisLeft(helpScale).tickSize(this.width).tickFormat('').ticks(4)
    var rightAxisElement = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.width - 1}, 0)`)
      .call(rightAxis)
  }

  // 更新左侧Y轴刻度
  updateYAxis() {
    var scale = this.createScaleForAxisY()
    var leftAxis = d3.axisRight(scale).tickSize(0).tickFormat(d => parseInt(d))

    this.leftAxisElement.call(leftAxis)

    // 调整刻度位置
    this.leftAxisElement.selectAll('.tick text')
      .attr('transform', (d, i, all) => {
        var offset = i == 0 ? 10 : (i == all.length - 1 ? -10 : -10)

        return `translate(0, ${offset})`
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
    this.volumeLeftAxisElement = this.volumeWrapper.append('g').attr('class', 'axis')
    this.updateVolumesYAxis()

    // 量图垂直辅助线
    var axisBottom = d3.axisTop(this.staticScale).tickSize(this.volHeight - 20).tickFormat('')
    var axisBottomElement = this.volumeWrapper.append('g')
      .attr('transform', `translate(0, ${this.volHeight - 1})`)
      .attr('class', 'axis')
      .call(axisBottom)

    var axisTop = d3.axisBottom(this.staticScale).tickSize(0).tickFormat('')
    var axisTopElement = this.volumeWrapper.append('g').attr('class', 'axis').call(axisTop)
    this.updateVolumes()

    // 量图水平辅助线
    var min = 0
    var max = d3.max(this.data.volumes)
    var scale = d3.scaleOrdinal().domain(['成交量:0', max, 0]).range([0, 20, this.volHeight])
    var axisLeft = d3.axisLeft(scale).tickSize(this.width)
    var axisLeftElement = this.volumeWrapper.append('g').attr('class', 'axis').attr('transform', `translate(${this.width - 1}, 0)`)
      .call(axisLeft)
  }

  // 声明量图绘制过程
  updateVolumes() {
    var min = 0
    var max = d3.max(this.data.volumes)
    var scaleX = d3.scaleLinear().domain([0, 661]).range([0, this.width])
    var scaleY = d3.scaleLinear().domain([min, max]).range([this.volHeight, 20])
    var data = this.data.volumes.map((v, i) => {
      var x0 = scaleX(i)
      var y0 = scaleY(v)

      return [{
        x: x0,
        y: y0
      }, {
        x: x0,
        y: this.volHeight
      }]
    })

    var vols = this.volumeWrapper.selectAll('.vol').data(data)
    var prices = this.data.prices
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

        return prices[i] > prices[i - 1] ? RED : prices[i] == prices[i - 1] ? UNKNOW : GREEN
      })
  }

  updateVolumesYAxis() {
    var min = 0
    var max = d3.max(this.data.volumes)
    var scale = d3.scaleOrdinal().domain(['成交量:0', max, 0]).range([0, 20, this.volHeight])
    var axis = d3.axisRight(scale).tickSize(0)
    this.volumeLeftAxisElement.call(axis)

    this.volumeLeftAxisElement.selectAll('.tick text')
      .attr('transform', `translate(0, 10)`)
  }

  // 声明分时绘制过程
  updateArea() {
    var baseHeight = this.baseHeight
    var svg = this.svg
    var min = d3.min(this.data.prices)
    var max = d3.max(this.data.prices)
    var scaleX = d3.scaleLinear().domain([0, 661]).range([0, this.width])
    var scaleY = d3.scaleLinear().domain([min, max]).range([baseHeight, 0])

    var areaElement = this.svg.select('.trend-area-wrap')

    var line = d3.line()
      .x((d, i) => scaleX(i))
      .y((d, i) => scaleY(d))

    var area = d3.area()
      .x((d, i) => scaleX(i))
      .y0((d, i) => scaleY(d))
      .y1(baseHeight)

    var trendLine = areaElement.selectAll('.trend-line').data([this.data.prices])

    trendLine.enter()
      .append('path')
      .attr('class', 'trend-line')
      .merge(trendLine)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', AREA_STROKE_COLOR)

    var trendArea = areaElement.selectAll('.trend-area').data([this.data.prices])

    trendArea.enter()
      .append('path')
      .attr('class', 'trend-area')
      .merge(trendArea)
      .attr('d', area)
      .attr('fill', AREA_STROKE_COLOR)
      .attr('opacity', '0.3')
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