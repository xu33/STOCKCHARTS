const scaleLinear = require('./scaleLinear')
const $ = require('jquery')
const Raphel = require('raphael')

const {
	OUTTER_MARGIN,
	VOL_HEIGHT,
	FONT_SIZE,
	STROKE_COLOR,
	WIN_COLOR,
	LOSS_COLOR
} = require('./config')

const px = require('./px')
const createPathString = require('./createPathString')

const ChartPrototype = {
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
		var scaleY = scaleLinear().domain([low, high]).rangeRound([this.height, 0])	
		var totalWidth = baseWidth - OUTTER_MARGIN * 2
		var count = candleData.length 
		var candleWidth = (2 * totalWidth) / (3 * count - 1)
		var candleSpace = candleWidth / 2

		if (candleSpace < 1) {
			candleSpace = 0
			candleWidth = totalWidth / count
		}

		// console.log('candleWidth, candleSpace', candleWidth, candleSpace)
		this.closeYList = []
		this.shadowXList = []
		this.paper.setStart()

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

			// console.log('蜡烛块信息:', px(x), px(y1), candleWidth, height)

			this.closeYList.push(y1)

			// 实体块
			this.paper.rect(x, y1, candleWidth, height).attr({
				'fill': color,
				'stroke-width': 0
			})

			// 上下影线
			var shadowX = px( x + round(candleWidth / 2) )
			var pathString = createPathString({
				x: shadowX,
				y: px( scaleY(high) )
			}, {
				x: shadowX,
				y: px( scaleY(low) )
			})

			this.shadowXList.push(shadowX)
			this.paper.path(pathString).attr('stroke', color)
		})

		this.candleWidth = candleWidth
		this.candleSpace = candleSpace
		this.candleY = scaleY

		this.candleSet = this.paper.setFinish()

		this.drawPolyline()
		this.hidePolySet()
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
		this.paper.rect(px(volX), px(volY), volWidth, volHeight - 1).attr('stroke', STROKE_COLOR)

		var maxVol = candleData.reduce((prev, curr) => {
			if (curr.volume > prev) {
				return curr.volume
			}

			return prev
		}, candleData[0].volume)

		var volLinear = scaleLinear().domain([0, maxVol]).rangeRound([0, volHeight])

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
	},
	createTooltip: function() {
		let tooltip = $('<div>').css({
			position: 'absolute',
			top: 10
		})

		if (this.options.tooltip.className) {
			tooltip.addClass(this.options.tooltip.className)
		}

		return tooltip
	},
	getTooltipHtml: function(data) {
		let fn = this.options.tooltip.fn
		let html = ''

		if (fn) {
			html = fn(data)
		}

		return html
	},
	createEventLayerNormal: function() {
		var elem = $('<div>').css({
			position: 'absolute',
			left: 0,
			top: 0,
			width: this.chartWidth,
			height: this.chartHeight
		})

		$(this.container).css({
			position:'relative'
		}).append(elem)

		var offset = elem.offset()
		var paper = new Raphel(elem[0], this.chartWidth, this.chartHeight)
		var scaleLeft
		var floatLine
		var tooltip

		var line = (x,y) => {
			if (!floatLine) {
				floatLine = paper.path(createPathString({
					x: px(x),
					y: px(0)
				}, {
					x: px(x),
					y: px(y)
				})).attr({
					stroke: STROKE_COLOR
				})
			}

			floatLine.attr({
				path: createPathString({
					x: px(x),
					y: px(0)
				}, {
					x: px(x),
					y: px(y)
				}),
				stroke: STROKE_COLOR
			})
		}

		elem.on('mouseenter', e => {
			if (scaleLeft === undefined) {
				scaleLeft = scaleLinear()
				.domain([0, this.width])
				.rangeRound([0, this.shadowXList.length - 1])
			}
			
			if (tooltip === undefined) {
				tooltip = this.createTooltip()

				this.eventLayer.append(tooltip)
			}
		})

		elem.on('mousemove', e => {
			if (this.shadowXList === undefined) {
				return
			}

			var x = e.pageX - offset.left
			var index = scaleLeft(x)
			var x = this.shadowXList[index]
			var item
			var top

			if (x === undefined) {
				return
			}

			line(x, this.needVolume ? this.height + FONT_SIZE + VOL_HEIGHT : this.height)
			item = this.candleData[index]
			top = this.closeYList[index]

			if (x >= this.width - tooltip.width()) {
				tooltip.css({
					'top': top,
					'left': '',
					'right': this.chartWidth - this.width + 5
				})
			} else {
				tooltip.css({
					'top': top,
					'left': x + 5,
					'right': ''
				})
			}

			tooltip.html( this.getTooltipHtml(item) )
		})

		elem.on('mouseleave', e => {
			scaleLeft = undefined
			floatLine = undefined
			paper.clear()
			tooltip.remove()
			tooltip = undefined
		})

		this.eventLayer = elem
	},
	createEventLayer: function() {
		var elem = $('<div>').css({
			position: 'absolute',
			left: 0,
			top: 0,
			width: this.chartWidth,
			height: this.chartHeight
		})

		$(this.container).css({
			position:'relative'
		}).append(elem)

		var offset = elem.offset()
		var paper = new Raphel(elem[0], this.chartWidth, this.chartHeight)
		var scaleLeft
		var scaleRight
		var floatLine
		var tooltip

		var line = (x,y) => {
			if (!floatLine) {
				floatLine = paper.path(createPathString({
					x: px(x),
					y: px(0)
				}, {
					x: px(x),
					y: px(y)
				})).attr({
					stroke: STROKE_COLOR
				})
			}

			floatLine.attr({
				path: createPathString({
					x: px(x),
					y: px(0)
				}, {
					x: px(x),
					y: px(y)
				}),
				stroke: STROKE_COLOR
			})
		}

		elem.on('mouseenter', e => {
			if (scaleLeft === undefined) {
				scaleLeft = scaleLinear()
					.domain([0, this.offset])
					.rangeRound([0, this.shadowXList.length - 1])

				if (this.predictXList) {
					scaleRight = scaleLinear()
						.domain([this.offset, this.width])
						.rangeRound([0, this.predictXList.length - 1])
				}
			}

			if (tooltip === undefined) {
				tooltip = this.createTooltip()

				this.eventLayer.append(tooltip)
			}
		})
		.on('mousemove', e => {
			if (this.shadowXList === undefined) {
				return
			}

			var x = e.pageX - offset.left
			var item
			var top

			if (x < this.offset) {
				var index = scaleLeft(x)
				var x = this.shadowXList[index]

				if (x === undefined) {
					return
				}

				line(x, this.needVolume ? this.chartHeight : this.height)	

				item = this.candleData[index]
				top = this.closeYList[index]
			} else {
				if (this.predictXList === undefined) {
					return
				}

				var index = scaleRight(x)

				if (index === 0) {
					return
				}

				if (index >= this.predictXList.length) {
					return
				}

				var x = this.predictXList[index]

				line(x, this.needVolume ? this.chartHeight : this.height)	
				item = this.predictData[index]
				top = this.predictCloseYList[index]
			}

			// console.log(x, this.width, tooltip.width())

			if (x >= this.width - tooltip.width()) {
				tooltip.css({
					'top': top,
					'left': '',
					'right': this.chartWidth - this.width + 5
				})
			} else {
				tooltip.css({
					'top': top,
					'left': x + 5,
					'right': ''
				})
			}

			tooltip.html( this.getTooltipHtml(item) )
		})
		.on('mouseleave', e => {
			scaleLeft = undefined
			scaleRight = undefined
			floatLine = undefined
			paper.clear()
			tooltip.remove()
			tooltip = undefined
		})

		this.eventLayer = elem
	},

	handleMouseMove: function(e, scaleLeft, scaleRight, offset, floatLine, tooltip, line) {
		if (this.shadowXList === undefined) {
				return
			}

			var x = e.pageX - offset.left
			var item
			var top

			if (x < this.offset) {
				var index = scaleLeft(x)
				var x = this.shadowXList[index]

				if (x === undefined) {
					return
				}

				line(x, this.needVolume ? this.chartHeight : this.height)	

				item = this.candleData[index]
				top = this.closeYList[index]
			} else {
				if (this.predictXList === undefined) {
					return
				}

				var index = scaleRight(x)

				if (index === 0) {
					return
				}

				if (index >= this.predictXList.length) {
					return
				}

				var x = this.predictXList[index]

				line(x, this.needVolume ? this.chartHeight : this.height)	

				item = this.predictData[index]

				top = this.predictCloseYList[index]
			}

			// console.log(x, this.width, tooltip.width())

			if (x >= this.width - tooltip.width()) {
				tooltip.css({
					'top': top,
					'left': '',
					'right': this.chartWidth - this.width + 5
				})
			} else {
				tooltip.css({
					'top': top,
					'left': x + 5,
					'right': ''
				})
			}

			tooltip.html( this.getTooltipHtml(item) )
	},

	handleMouseEnd: function() {

	},

	hideCandleSet: function() {
		if (this.candleSet) {
			this.candleSet.hide()
		}
	},

	showCandleSet: function() {
		this.candleSet.show()
	},

	hidePolySet: function() {
		if (this.polySet) {
			this.polySet.hide()
		}
	},

	showPolySet: function() {
		this.polySet.show()
	},
	// 收盘价折线
	drawPolyline: function() {
		this.paper.setStart()

		var points = this.candleData.map((item, i) => {
			var x = this.shadowXList[i]
			var y = this.candleY(this.candleData[i].close)
			
			return {
				x: px(x),
				y: px(y)
			}
		})

		this.paper.path( createPathString(...points) ).attr({
			stroke: '#999'
		})

		this.polySet = this.paper.setFinish()
	},
	clear: function() {
		this.candleSet && this.candleSet.clear()
		this.polySet && this.polySet.clear()
		this.paper.clear()
	},
	update: function( { candleData, predictData, cycle } ) {
		this.clear()

		if (candleData !== undefined) {
			this.candleData = candleData.map(str2number)
		}

		if (predictData !== undefined) {
			this.predictData = predictData.map(str2number)
		}
		
		if (cycle !== undefined) {
			this.cycle = cycle
		}

		this.draw()
	}
}

module.exports = ChartPrototype