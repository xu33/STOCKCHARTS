const str2number = require('./libs/str2number')
const scaleLinear = require('./libs/scaleLinear')
const Raphel = require('raphael')
const objectAssign = require('object-assign')
const {
	OUTTER_MARGIN,
	VOL_HEIGHT,
	BOTTOM_TEXT_HEIGHT,
	PIXEL_FIX,
	STROKE_COLOR,
	FONT_SIZE,
	TEXT_COLOR,
  TEXT_MARGIN
} = require('./libs/config')
const px = require('./libs/px')
const createPathString = require('./libs/createPathString')
const ChartPrototype = require('./libs/ChartPrototype')

const ChartWithVolume = function(container, {
  chartWidth, 
  chartHeight,
  candleData, 
  needVolume, 
  ticksY,
  cycle,
  tooltip
}) {
	this.container = container
	this.paper = new Raphel(container, chartWidth, chartHeight)
	this.chartWidth = chartWidth
	this.chartHeight = chartHeight
	
	this.candleData = candleData.map(str2number)
	this.needVolume = needVolume || false
	this.ticksY = ticksY || 4
	this.cycle = cycle

	this.options = {
		tooltip: tooltip
	}
}

ChartWithVolume.prototype = {
	draw: function() {
		var volHeight = this.needVolume ? VOL_HEIGHT : 0
		var { candleData } = this

		var low = candleData.reduce((prev, curr) => {
			if (curr.low < prev) {
				return curr.low
			}

			return prev
		}, candleData[0].low)

		var high = candleData.reduce((prev, curr) => {
			if (curr.high > prev) {
				return curr.high
			}

			return prev
		}, candleData[0].high)

		this.low = low
		this.high = high

		// this.width = this.chartWidth - 40 // 总宽度减y轴文字宽度
    this.width = this.chartWidth
		this.height = this.chartHeight - volHeight - FONT_SIZE - TEXT_MARGIN * 2 - BOTTOM_TEXT_HEIGHT // 总高度减量柱高度减x轴文字高度减底部标注高度

		this.paper.rect(0, 0, this.width, this.height).attr({
			stroke: STROKE_COLOR
		})

		var total = candleData.length
		// var predictPercent = (total - this.cycle) / total

		// console.log('predictPercent:', predictPercent)

		// predictPercent = predictPercent.toFixed(2)

		var predictPercent = 0.7

		// 预测部分图形的偏移量
		this.offset = this.width * predictPercent

		var yScale = scaleLinear().domain([0, this.ticksY - 1]).rangeRound([0, this.height])

		// 预测部分半透明虚框
		var pathString = createPathString({
			x: this.offset,
			y: 0
		}, {
			x: this.width,
			y: 0
		}, {
			x: this.width,
			y: this.height + volHeight + FONT_SIZE + TEXT_MARGIN * 2
		}, {
			x: this.offset,
			y: this.height + volHeight + FONT_SIZE + TEXT_MARGIN * 2
		}, {
			x: this.offset,
			y: 0
		})

		this.paper.path(pathString).attr({
			'fill': '#f5f9fd',
			'stroke-width': 1,
			'fill-opacity': 0.5,
			'stroke': '#79c0ff',
		})

		// x轴信息
		var dates = [
			candleData[0].time,
		    candleData[candleData.length - this.cycle].time,
		    candleData[candleData.length - 1].time
		]

		dates.forEach((item, index, arr) => {
			var elem = this.paper.text(0, 0, item).attr('fill', '#999')
			var box = elem.getBBox()
			var { width, height } = box

			var x
      var y = this.height + height / 2 + TEXT_MARGIN

			if (index === 0) {
				x = 0 + width / 2
			} else if (index === 1) {
				x = this.offset - width / 2
			} else {
				x = this.width - width / 2
			}

			elem.attr({
				x: x,
				y: y
			})
		})

		// K线横向辅助线
		// this.drawHelperLines(yScale)
		this.drawCandles(this.width)

		// 绘制量柱
		if (this.needVolume) {
			this.drawVolumes()
		}

		this.drawCycleBlock()
		// 事件
		if (this.options.tooltip) {
			this.createEventLayerNormal()
		}
	},
	drawCycleBlock: function() {
		console.log('drawCycleBlock fire')
		// 后续走势标注
		this.paper.path(createPathString({
			x: this.offset,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT
		}, {
			x: this.offset,
			y: this.chartHeight
		})).attr({
			stroke: TEXT_COLOR
		})

		this.paper.path(createPathString({
			x: this.width,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT
		}, {
			x: this.width,
			y: this.chartHeight
		})).attr({
			stroke: TEXT_COLOR
		})

		// 后续走势
		var txt = this.paper.text(this.offset, this.chartHeight - BOTTOM_TEXT_HEIGHT, '后续走势').attr('fill', '#0287fe')

		var box = txt.getBBox()
		var { width, height } = box
		var x = (this.width - this.offset) / 2 + this.offset
		var y = this.chartHeight - BOTTOM_TEXT_HEIGHT + height / 2 + (BOTTOM_TEXT_HEIGHT - height) / 2

		txt.attr({
			x: x,
			y: y
		})

		// |-
		this.paper.path(createPathString({
			x: this.offset,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT / 2
		}, {
			x: x - width / 2,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT / 2
		})).attr({
			stroke: '#0287fe'
		})

		// -|
		this.paper.path(createPathString({
			x: this.width,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT / 2
		}, {
			x: x + width / 2,
			y: this.chartHeight - BOTTOM_TEXT_HEIGHT / 2
		})).attr({
			stroke: '#0287fe'
		})
	}
}

objectAssign(ChartWithVolume.prototype, ChartPrototype)

module.exports = ChartWithVolume