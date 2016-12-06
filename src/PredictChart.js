const str2number = require('./libs/str2number')
const scaleLinear = require('./libs/scaleLinear')
const UnitUtil = require('./libs/UnitUtil')
const Raphel = require('raphael')
const predictPercent = 0.7 // 预测部分偏移量
const ChartPrototype = require('./libs/ChartPrototype')
const createPathString = require('./libs/createPathString')
const objectAssign = require('object-assign')

const {
	OUTTER_MARGIN,
	VOL_HEIGHT,
	BOTTOM_TEXT_HEIGHT,
	PIXEL_FIX,
	STROKE_COLOR,
	DASH_COLOR,
	FONT_SIZE,
	TEXT_COLOR,
	TEXT_MARGIN
} = require('./libs/config')

const px = require('./libs/px')

const PredictChart = function(container, { chartWidth, chartHeight, candleData, predictData, needVolume, ticksY, tooltip, yAxisFormater }) {
	this.container = container
	this.paper = new Raphel(container, chartWidth, chartHeight)
	this.chartWidth = chartWidth
	this.chartHeight = chartHeight
	
	this.candleData = candleData.map(str2number)
	this.predictData = predictData.map(str2number)
	this.needVolume = needVolume
	this.ticksY = ticksY

	this.options = {
		tooltip: tooltip,
    yAxisFormater: yAxisFormater
	}
}

PredictChart.prototype = {
	draw: function() {
		var { candleData, predictData } = this
		var all = candleData.concat(predictData)

		var low = all.reduce((prev, curr) => {
			if (curr.low < prev) {
				return curr.low
			}

			return prev
		}, all[0].low)

		var high = all.reduce((prev, curr) => {
			if (curr.high > prev) {
				return curr.high
			}

			return prev
		}, all[0].high)

    if (this.options.yAxisFormater) {
      this.low = this.options.yAxisFormater(low)
      this.high = this.options.yAxisFormater(high)
    } else {
      this.low = low.toFixed(2)
      this.high = high.toFixed(2)
    }

    var maxVol = candleData.reduce((prev, curr) => Math.max(curr.volume, prev), candleData[0].volume)

		// 测量宽度
    var maxVolDisplay = UnitUtil.million(maxVol)
    var widest

    if (encodeURI(maxVolDisplay).length > encodeURI(this.high).length) {
      widest = maxVolDisplay
    } else {
      widest = this.high
    }

    var tempText = this.paper.text(0, 0, widest)
    var bbox = tempText.getBBox()
    this.yAxisTextWidth = bbox.width
    tempText.remove()

		var yAxisTextWidth = this.yAxisTextWidth
		this.width = this.chartWidth - yAxisTextWidth - TEXT_MARGIN // 总宽度减y轴文字宽度

    if (this.needVolume) {
      this.height = this.chartHeight - VOL_HEIGHT - FONT_SIZE - TEXT_MARGIN * 2 // 总高度减量柱高度减x轴文字高度
    } else {
      this.height = this.chartHeight - FONT_SIZE - TEXT_MARGIN
    }

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
			'fill': '#e7f2fc',
			'stroke-width': 0,
			'fill-opacity': 0.6
		})

		// 虚框左侧虚线
    let x1 = px(this.offset)
    let y1 = px(0)
    let x2 = px(this.offset)
    let y2
    if (this.needVolume) {
      y2 = px(this.height + VOL_HEIGHT + FONT_SIZE + TEXT_MARGIN * 2)
    } else {
      y2 = px(this.height)
    }

		this.paper.path(createPathString({
			x: x1,
			y: y1
		}, {
			x: x2,
			y: y2
		})).attr({
			stroke: DASH_COLOR,
			"stroke-dasharray": '- '
		})
		
		// y轴文字信息
		var priceScale = scaleLinear().domain([0, this.ticksY - 1]).range([low, high])

		for (var i = 0; i < this.ticksY; i++) {
			let x = this.width
			let y = yScale(i)
      let txt = priceScale(i)

      if (this.options.yAxisFormater) {
        txt = this.options.yAxisFormater(txt)
      } else {
        txt = Number(txt).toFixed(2)
      }

			let elem = this.paper.text(x, y, txt).attr('fill', '#999')
			let box = elem.getBBox()
			let { width, height } = box

      console.log('txt:', txt, width)

			x = x + (width >> 1) + TEXT_MARGIN

			y = i === 0 ? 
				(this.height - y - height / 2) :
				(this.height - y + height / 2)

			elem.attr({
				x: x, 
				y: y
			})
		}

		// x轴文字信息
		var dates = [
			candleData[0].time, 
			candleData[candleData.length - 1].time, 
			predictData[predictData.length - 1].time
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

    // 量线
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

objectAssign(PredictChart.prototype, ChartPrototype)

module.exports = PredictChart