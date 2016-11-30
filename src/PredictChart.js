const str2number = require('./libs/str2number')
const fakeData = require('./fake_data/pre.js')
const scaleLinear = require('./libs/scaleLinear')
const Raphel = require('raphael')
const predictPercent = 0.7 // 预测部分偏移量
const ChartPrototype = require('./libs/ChartPrototype')
const createPathString = require('./libs/createPathString')

const {
	OUTTER_MARGIN,
	VOL_HEIGHT,
	BOTTOM_TEXT_HEIGHT,
	PIXEL_FIX,
	STROKE_COLOR,
	DASH_COLOR,
	FONT_SIZE,
	TEXT_COLOR
} = require('./libs/config')

const px = require('./libs/px')

const PredictChart = function(container, { chartWidth, chartHeight, candleData, predictData, needVolume, ticksY, tooltip }) {
	this.container = container
	this.paper = new Raphel(container, chartWidth, chartHeight)
	this.chartWidth = chartWidth
	this.chartHeight = chartHeight
	
	this.candleData = candleData.map(str2number)
	this.predictData = predictData.map(str2number)
	this.needVolume = needVolume
	this.ticksY = ticksY

	this.options = {
		tooltip: tooltip
	}
}

PredictChart.fakeData = fakeData

PredictChart.prototype = {
	draw: function() {
		var volHeight = this.needVolume ? VOL_HEIGHT : 0
		var { candleData, predictData } = this
		var fakeData = candleData.concat(predictData)

		var low = fakeData.reduce((prev, curr) => {
			if (curr.low < prev) {
				return curr.low
			}

			return prev
		}, fakeData[0].low)

		var high = fakeData.reduce((prev, curr) => {
			if (curr.high > prev) {
				return curr.high
			}

			return prev
		}, fakeData[0].high)

		this.low = low.toFixed(2)
		this.high = high.toFixed(2)

		// 测量宽度
		var tempText = this.paper.text(this.high)
		var yAxisTextWidth = tempText.getBBox().width

		console.log('yAxisTextWidth', yAxisTextWidth)
		
		tempText.remove()

		this.width = this.chartWidth - yAxisTextWidth // 总宽度减y轴文字宽度
		this.height = this.chartHeight - volHeight - FONT_SIZE // 总高度减量柱高度减x轴文字高度

		this.paper.rect(px(0), px(0), this.width, this.height).attr({
			stroke: STROKE_COLOR
		})

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
			y: this.height
		}, {
			x: this.offset,
			y: this.height
		})

		this.paper.path(pathString).attr({
			'fill': '#f5f9fd',
			'stroke-width': 0,
			'fill-opacity': 0.5
		})

		// 虚框左侧虚线
		this.paper.path(createPathString({
			x: px(this.offset),
			y: px(0)	
		}, {
			x: px(this.offset),
			y: this.needVolume ? px(this.height + volHeight + FONT_SIZE) : px(this.height)
		})).attr({
			stroke: DASH_COLOR,
			"stroke-dasharray": '- '
		})
		
		// y轴信息
		var priceScale = scaleLinear().domain([0, this.ticksY - 1]).rangeRound([low, high])

		for (var i = 0; i < this.ticksY; i++) {
			var x = this.width
			var y = yScale(i)
			var elem = this.paper.text(x, y, priceScale(i).toFixed(2)).attr('fill', '#999')
			var box = elem.getBBox()
			var {width, height} = box

			elem.attr({
				x: x + width - 10
			})

			if (i === 0) {
				elem.attr({
					y: this.height - y - height / 2
				})
			} else if (i === this.ticksY - 1) {
				elem.attr({
					y: this.height - y + height / 2
				})
			}
		}

		// x轴信息
		var dates = [candleData[0].time, candleData[candleData.length - 1].time, predictData[predictData.length - 1].time]

		dates = dates.map(v => {
			var d = new Date(v),
		        month = '' + (d.getMonth() + 1),
		        day = '' + d.getDate(),
		        year = d.getFullYear();

		    if (month.length < 2) month = '0' + month;
		    if (day.length < 2) day = '0' + day;

		    return [year, month, day].join('-');
		})

		dates.forEach((item, index, arr) => {
			var elem = this.paper.text(0, 0, item).attr('fill', '#999')
			var box = elem.getBBox()
			var { width, height } = box

			var x, y = this.height + height / 2 + (FONT_SIZE - height) / 2

			if (index === 0) {
				x = 0 + width / 2
			} else if (index === 1) {
				x = this.offset - width / 2
			} else {
				x = this.width - width / 2

				if (width > this.width - this.offset) {
					x = this.width
				}
			}

			elem.attr({
				x: x,
				y: y
			})
		})

		// 横向辅助线
		this.drawHelperLines(yScale)

		this.drawCandles(this.offset)
		this.drawPredictWave()

		if (this.needVolume) {
			this.drawVolumes()
		}

		// 事件
		if (this.options.tooltip) {
			this.createEventLayer()
		}
	},
	// 画预测图
	drawPredictWave: function() {
		var { candleData, predictData } = this

		var color1 = '#80b5ff'
		var color2 = '#e63232'
		var linearP = scaleLinear().domain([0, predictData.length]).rangeRound([this.offset, this.width])
		var linearY = this.candleY
		var upString = []
		var midString = []
		var downString = []
		var lastCandle = candleData[candleData.length - 1]

		predictData.unshift({
			low: lastCandle.close,
			high: lastCandle.close,
			close: lastCandle.close
		})

		// console.log(predictData.length)

		// 预测波动折线，计算公式，后面的要转成0.xx
		// high = last_day_close * ceil
		// low = last_day_close * flor
		// close = last_day_close * profit 

		this.predictCloseYList = []
		this.predictXList = []
		for (let i = 0; i < predictData.length; i++) {
			let predictX = linearP(i)

			upString.push({
				x: predictX,
				y: linearY(predictData[i].high)
			})

			midString.push({
				x: predictX,
				y: linearY(predictData[i].close)
			})

			this.predictCloseYList.push(linearY(predictData[i].close))

			downString.push({
				x: predictX,
				y: linearY(predictData[i].low)
			})

			this.predictXList.push(predictX)
		}

		// console.log(upString, midString, downString)
		this.paper.path(createPathString(...upString)).attr('stroke', color1)
		this.paper.path(createPathString(...midString)).attr('stroke', color2)
		this.paper.path(createPathString(...downString)).attr('stroke', color1)

		// 预测部分虚线参考线开始位置再实际k线最后一根收盘处
		var y = linearY(lastCandle.close)
		var str = createPathString({
			x: linearP(0),
			y: y
		}, {
			x: this.width,
			y: y
		})

		this.paper.path(str).attr({
			stroke: DASH_COLOR,
			"stroke-dasharray": '- '
		})
	}
}

Object.assign(PredictChart.prototype, ChartPrototype)

module.exports = PredictChart