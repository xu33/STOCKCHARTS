const d3 = require('d3-scale')

const {
	MARGIN_TABLE,
	CANDLE_WIDTH,
	OUTTER_MARGIN,
	VOL_HEIGHT,
	FONT_SIZE,
	STROKE_COLOR,
	WIN_COLOR,
	LOSS_COLOR,
	PIXEL_FIX
} = require('./config')

const px = function(value) {
	value = Math.floor(value)
	return value + PIXEL_FIX
}

const createPathString = require('./createPathString')

module.exports = {
	drawHelperLines: function(yScale) {
		// K线横向辅助线
		for (var i = 1; i < this.ticksY - 1; i++) {
			let x1 = px(0)
			let y1 = px(this.height - yScale(i))
			let x2 = px(this.width)
			let y2 = px(this.height - yScale(i))

			// console.log(x1, y1, x2, y2)

			let pathString = createPathString({x: x1, y: y1}, {x: x2, y: y2})

			this.paper.path(pathString).attr({
				stroke: STROKE_COLOR
			})
		}
	},
	drawCandles: function(baseWidth) {
		var round = Math.round
		var { candleData, predictData, low, high } = this
		var scaleY = d3.scaleLinear().domain([low, high]).rangeRound([this.height, 0])	
		var totalWidth = baseWidth - OUTTER_MARGIN * 2
		var count = candleData.length 
		var candleWidth = (2 * totalWidth) / (3 * count - 1)
		var candleSpace = candleWidth / 2

		if (candleSpace < 1) {
			candleSpace = 0
			candleWidth = totalWidth / count
		}

		// console.log('candleWidth, candleSpace', candleWidth, candleSpace)

		candleData.forEach((item, index) => {
			let { open, close, low, high } = item
			let x = OUTTER_MARGIN + round(index * (candleWidth + candleSpace))
			let y1, y2, color, height

			if (open > close) {
				y1 = scaleY(open)
				y2 = scaleY(close)

				color = LOSS_COLOR
			} else {
				y1 = scaleY(close)
				y2 = scaleY(open)

				color = WIN_COLOR
			}

			height = Math.abs(y1 - y2)

			console.log('蜡烛块信息:', px(x), px(y1), candleWidth, height)

			// 实体块
			this.paper.rect(x, y1, candleWidth, height).attr({
				'fill': color,
				'stroke-width': 0
			})

			// 上下影线
			var pathString = createPathString({
				x: px( x + round(candleWidth / 2) ),
				y: px( scaleY(high) )
			}, {
				x: px( x + round(candleWidth / 2) ),
				y: px( scaleY(low) )
			})

			this.paper.path(pathString).attr('stroke', color)
		})

		this.candleWidth = candleWidth
		this.candleSpace = candleSpace
		this.candleY = scaleY
	},
	drawVolumes: function() {
		var round = Math.round
		// 量线，绘制量柱
		var volX = 0
		var volY = this.height + FONT_SIZE // 加文字高度
		var volWidth = this.width
		var volHeight = VOL_HEIGHT
		var candleData = this.candleData

		var { candleWidth, candleSpace } = this
		// 量图边框
		this.paper.rect(px(volX), px(volY), volWidth, volHeight).attr('stroke', STROKE_COLOR)

		var maxVol = candleData.reduce((prev, curr) => {
			if (curr.volume > prev) {
				return curr.volume
			}

			return prev
		}, candleData[0].volume)

		var volLinear = d3.scaleLinear().domain([0, maxVol]).rangeRound([0, volHeight])

		// 量柱横向辅助线
		var p1 = {
			x: px(0),
			y: px( this.height + FONT_SIZE + (volHeight >> 1) )
		}

		var p2 = {
			x: px(this.width),
			y: px( this.height + FONT_SIZE + (volHeight >> 1) )
		}

		this.paper.path(createPathString(p1, p2)).attr({
			stroke: STROKE_COLOR
		})

		// 量柱
		candleData.forEach((item, index, arr) => {
			let x = OUTTER_MARGIN + round(index * (candleWidth + candleSpace))
			let h = volLinear(item.volume)
			let y = this.height + FONT_SIZE + volHeight - h
			let { open, close } = item
			let color

			if (open > close) {
				color = '#55a500'
			} else {
				color = '#e63232'
			}

			this.paper.rect(x, y, candleWidth, h).attr({
				fill: color,
				'stroke-width': 0
			})
		})
	}
}