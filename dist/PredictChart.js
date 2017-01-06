var PredictChart =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var str2number = __webpack_require__(1);
	var scaleLinear = __webpack_require__(2);
	var UnitUtil = __webpack_require__(10);
	var Raphel = __webpack_require__(3);
	var predictPercent = 0.7; // 预测部分偏移量
	var ChartPrototype = __webpack_require__(8);
	var createPathString = __webpack_require__(7);
	var objectAssign = __webpack_require__(4);

	var _require = __webpack_require__(5),
	    OUTTER_MARGIN = _require.OUTTER_MARGIN,
	    VOL_HEIGHT = _require.VOL_HEIGHT,
	    BOTTOM_TEXT_HEIGHT = _require.BOTTOM_TEXT_HEIGHT,
	    PIXEL_FIX = _require.PIXEL_FIX,
	    STROKE_COLOR = _require.STROKE_COLOR,
	    DASH_COLOR = _require.DASH_COLOR,
	    FONT_SIZE = _require.FONT_SIZE,
	    TEXT_COLOR = _require.TEXT_COLOR,
	    TEXT_MARGIN = _require.TEXT_MARGIN;

	var px = __webpack_require__(6);

	var PredictChart = function PredictChart(container, _ref) {
		var chartWidth = _ref.chartWidth,
		    chartHeight = _ref.chartHeight,
		    candleData = _ref.candleData,
		    predictData = _ref.predictData,
		    needVolume = _ref.needVolume,
		    ticksY = _ref.ticksY,
		    tooltip = _ref.tooltip,
		    yAxisFormater = _ref.yAxisFormater;

		this.container = container;
		this.paper = new Raphel(container, chartWidth, chartHeight);
		this.chartWidth = chartWidth;
		this.chartHeight = chartHeight;

		this.candleData = candleData.map(str2number);
		this.predictData = predictData.map(str2number);
		this.needVolume = needVolume;
		this.ticksY = ticksY;

		this.options = {
			tooltip: tooltip,
			yAxisFormater: yAxisFormater
		};
	};

	PredictChart.prototype = {
		draw: function draw() {
			var _this = this;

			var candleData = this.candleData,
			    predictData = this.predictData;

			var all = candleData.concat(predictData);

			var low = all.reduce(function (prev, curr) {
				if (curr.low < prev) {
					return curr.low;
				}

				return prev;
			}, all[0].low);

			var high = all.reduce(function (prev, curr) {
				if (curr.high > prev) {
					return curr.high;
				}

				return prev;
			}, all[0].high);

			if (this.options.yAxisFormater) {
				this.low = this.options.yAxisFormater(low);
				this.high = this.options.yAxisFormater(high);
			} else {
				this.low = low.toFixed(2);
				this.high = high.toFixed(2);
			}

			var maxVol = candleData.reduce(function (prev, curr) {
				return Math.max(curr.volume, prev);
			}, candleData[0].volume);

			// 测量宽度
			var maxVolDisplay = UnitUtil.million(maxVol);
			var widest;

			if (encodeURI(maxVolDisplay).length > encodeURI(this.high).length) {
				widest = maxVolDisplay;
			} else {
				widest = this.high;
			}

			var tempText = this.paper.text(0, 0, widest);
			var bbox = tempText.getBBox();
			this.yAxisTextWidth = bbox.width;
			tempText.remove();

			var yAxisTextWidth = this.yAxisTextWidth;
			this.width = this.chartWidth - yAxisTextWidth - TEXT_MARGIN; // 总宽度减y轴文字宽度

			if (this.needVolume) {
				this.height = this.chartHeight - VOL_HEIGHT - FONT_SIZE - TEXT_MARGIN * 2; // 总高度减量柱高度减x轴文字高度
			} else {
				this.height = this.chartHeight - FONT_SIZE - TEXT_MARGIN;
			}

			this.paper.rect(px(0), px(0), this.width, this.height).attr({
				stroke: STROKE_COLOR
			});

			// 预测部分图形的偏移量
			this.offset = this.width * predictPercent;

			var yScale = scaleLinear().domain([0, this.ticksY - 1]).rangeRound([0, this.height]);

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
			});

			this.paper.path(pathString).attr({
				'fill': '#e7f2fc',
				'stroke-width': 0,
				'fill-opacity': 0.6
			});

			// 虚框左侧虚线
			var x1 = px(this.offset);
			var y1 = px(0);
			var x2 = px(this.offset);
			var y2 = void 0;
			if (this.needVolume) {
				y2 = px(this.height + VOL_HEIGHT + FONT_SIZE + TEXT_MARGIN * 2);
			} else {
				y2 = px(this.height);
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
			});

			// y轴文字信息
			var priceScale = scaleLinear().domain([0, this.ticksY - 1]).range([low, high]);

			for (var i = 0; i < this.ticksY; i++) {
				var x = this.width;
				var y = yScale(i);
				var txt = priceScale(i);

				if (this.options.yAxisFormater) {
					txt = this.options.yAxisFormater(txt);
				} else {
					txt = Number(txt).toFixed(2);
				}

				var elem = this.paper.text(x, y, txt).attr('fill', '#999');
				var box = elem.getBBox();
				var width = box.width,
				    height = box.height;


				x = x + (width >> 1) + TEXT_MARGIN;

				y = i === 0 ? this.height - y - height / 2 : this.height - y + height / 2;

				elem.attr({
					x: x,
					y: y
				});
			}

			// x轴文字信息
			var dates = [candleData[0].time, candleData[candleData.length - 1].time, predictData[predictData.length - 1].time];

			dates.forEach(function (item, index, arr) {
				var elem = _this.paper.text(0, 0, item).attr('fill', '#999');
				var box = elem.getBBox();
				var width = box.width,
				    height = box.height;


				var x;
				var y = _this.height + height / 2 + TEXT_MARGIN;

				if (index === 0) {
					x = 0 + width / 2;
				} else if (index === 1) {
					x = _this.offset - width / 2;
				} else {
					x = _this.width - width / 2;

					if (width > _this.width - _this.offset) {
						x = _this.width;
					}
				}

				elem.attr({
					x: x,
					y: y
				});
			});

			// 横向辅助线
			this.drawHelperLines(yScale);
			this.drawCandles(this.offset);
			this.drawPredictWave();

			// 量线
			if (this.needVolume) {
				this.drawVolumes();
			}

			// 事件
			if (this.options.tooltip) {
				this.createEventLayer();
			}
		},
		// 画预测图
		drawPredictWave: function drawPredictWave() {
			var candleData = this.candleData,
			    predictData = this.predictData;


			var color1 = '#80b5ff';
			var color2 = '#e63232';
			var linearP = scaleLinear().domain([0, predictData.length]).rangeRound([this.offset, this.width]);
			var linearY = this.candleY;
			var upString = [];
			var midString = [];
			var downString = [];
			var lastCandle = candleData[candleData.length - 1];

			predictData.unshift({
				low: lastCandle.close,
				high: lastCandle.close,
				close: lastCandle.close
			});

			this.predictCloseYList = [];
			this.predictXList = [];

			for (var i = 0; i < predictData.length; i++) {
				var predictX = linearP(i);

				upString.push({
					x: predictX,
					y: linearY(predictData[i].high)
				});

				midString.push({
					x: predictX,
					y: linearY(predictData[i].close)
				});

				this.predictCloseYList.push(linearY(predictData[i].close));

				downString.push({
					x: predictX,
					y: linearY(predictData[i].low)
				});

				this.predictXList.push(predictX);
			}

			// console.log(upString, midString, downString)
			this.paper.path(createPathString.apply(undefined, upString)).attr('stroke', color1);
			this.paper.path(createPathString.apply(undefined, midString)).attr('stroke', color2);
			this.paper.path(createPathString.apply(undefined, downString)).attr('stroke', color1);

			// 预测部分虚线参考线开始位置再实际k线最后一根收盘处
			var y = linearY(lastCandle.close);
			var str = createPathString({
				x: linearP(0),
				y: y
			}, {
				x: this.width,
				y: y
			});

			this.paper.path(str).attr({
				stroke: DASH_COLOR,
				"stroke-dasharray": '- '
			});
		}
	};

	objectAssign(PredictChart.prototype, ChartPrototype);

	module.exports = PredictChart;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (stock) {
		var keys = ['low', 'high', 'open', 'close'];

		keys.forEach(function (key) {
			stock[key] = +stock[key];
		});

		return stock;
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	var scaleLinear = function scaleLinear() {
	  var min, max;

	  var normalize = function normalize(x) {
	    return (x - min) / (max - min);
	  };

	  var domain = function domain(arr) {
	    min = arr[0];
	    max = arr[arr.length - 1];

	    return this;
	  };

	  var range = function range(arr) {
	    var a = arr[0];
	    var b = arr[arr.length - 1];

	    a = +a;
	    b -= a;

	    return function (x) {
	      return a + b * normalize(x);
	    };
	  };

	  var rangeRound = function rangeRound(arr) {
	    var a = arr[0];
	    var b = arr[arr.length - 1];

	    a = +a;
	    b -= a;

	    return function (x) {
	      return Math.round(a + b * normalize(x));
	    };
	  };

	  return {
	    domain: domain,
	    range: range,
	    rangeRound: rangeRound
	  };
	};

	// const scaleLinear = require('d3-scale').scaleLinear

	module.exports = scaleLinear;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = window.Raphael;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var MARGIN_TABLE = {
		10: 4,
		20: 3,
		40: 1,
		60: 1
	};

	var PIXEL_FIX = 0.5;
	var OUTTER_MARGIN = 2;
	var VOL_HEIGHT = 66;
	var FONT_SIZE = 12;
	var WIN_COLOR = '#e63232';
	var LOSS_COLOR = '#55a500';
	var EQUAL_COLOR = '#999999';
	var STROKE_COLOR = '#d8d8d8';
	var DASH_COLOR = '#999999';
	var BOTTOM_TEXT_HEIGHT = 20;
	var TEXT_COLOR = '#0287fe';
	var TEXT_MARGIN = 10;

	module.exports = {
		MARGIN_TABLE: MARGIN_TABLE,
		OUTTER_MARGIN: OUTTER_MARGIN,
		VOL_HEIGHT: VOL_HEIGHT,
		FONT_SIZE: FONT_SIZE,
		PIXEL_FIX: PIXEL_FIX,
		WIN_COLOR: WIN_COLOR,
		LOSS_COLOR: LOSS_COLOR,
		STROKE_COLOR: STROKE_COLOR,
		DASH_COLOR: DASH_COLOR,
		BOTTOM_TEXT_HEIGHT: BOTTOM_TEXT_HEIGHT,
		TEXT_COLOR: TEXT_COLOR,
		TEXT_MARGIN: TEXT_MARGIN,
		EQUAL_COLOR: EQUAL_COLOR
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var pixelFix = 0.5;

	var px = function px(value) {
		value = Math.floor(value);
		return value + pixelFix;
	};

	module.exports = px;

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	var createPathString = function createPathString() {
		for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
			points[_key] = arguments[_key];
		}

		var pathString = "M" + points[0].x + "," + points[0].y;

		for (var i = 1; i < points.length; i++) {
			pathString += "L" + points[i].x + "," + points[i].y;
		}

		return pathString;
	};

	module.exports = createPathString;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var scaleLinear = __webpack_require__(2);
	var $ = __webpack_require__(9);
	var Raphel = __webpack_require__(3);
	var str2number = __webpack_require__(1);
	var UnitUtil = __webpack_require__(10);

	var _require = __webpack_require__(5),
	    OUTTER_MARGIN = _require.OUTTER_MARGIN,
	    VOL_HEIGHT = _require.VOL_HEIGHT,
	    FONT_SIZE = _require.FONT_SIZE,
	    STROKE_COLOR = _require.STROKE_COLOR,
	    WIN_COLOR = _require.WIN_COLOR,
	    LOSS_COLOR = _require.LOSS_COLOR,
	    EQUAL_COLOR = _require.EQUAL_COLOR,
	    TEXT_MARGIN = _require.TEXT_MARGIN;

	var px = __webpack_require__(6);
	var createPathString = __webpack_require__(7);

	var ChartPrototype = {
		drawBasic: function drawBasic() {},
		drawHelperLines: function drawHelperLines(yScale) {
			// K线横向辅助线
			for (var i = 1; i < this.ticksY - 1; i++) {
				var x1 = px(0);
				var y1 = px(this.height - yScale(i));
				var x2 = px(this.width);
				var y2 = px(this.height - yScale(i));

				// console.log(x1, y1, x2, y2)

				var pathString = createPathString({ x: x1, y: y1 }, { x: x2, y: y2 });

				this.paper.path(pathString).attr({
					stroke: STROKE_COLOR
				});
			}
		},
		drawCandles: function drawCandles(baseWidth) {
			var _this = this;

			var round = Math.round;
			var candleData = this.candleData,
			    predictData = this.predictData,
			    low = this.low,
			    high = this.high;

			var scaleY = scaleLinear().domain([low, high]).rangeRound([this.height, 0]);
			var totalWidth = baseWidth - OUTTER_MARGIN * 2;
			var count = candleData.length;
			var candleWidth = 2 * totalWidth / (3 * count - 1);
			var candleSpace = candleWidth / 2;

			if (candleSpace < 1) {
				candleSpace = 0;
				candleWidth = totalWidth / count;
			}

			this.closeYList = [];
			this.shadowXList = [];
			this.paper.setStart();

			candleData.forEach(function (item, index) {
				var open = item.open,
				    close = item.close,
				    low = item.low,
				    high = item.high;

				var x = OUTTER_MARGIN + round(index * (candleWidth + candleSpace));
				var y1 = void 0,
				    y2 = void 0,
				    color = void 0,
				    height = void 0;

				if (open > close) {
					y1 = scaleY(open);
					y2 = scaleY(close);

					color = LOSS_COLOR;
				} else if (open < close) {
					y1 = scaleY(close);
					y2 = scaleY(open);

					color = WIN_COLOR;
				} else {
					y1 = y2 = scaleY(open);
					color = EQUAL_COLOR;
				}

				height = Math.abs(y1 - y2);

				if (height < 1) {
					height = 1;
				}

				// console.log('蜡烛块信息:', px(x), px(y1), candleWidth, height)

				_this.closeYList.push(y1);

				// 实体块
				if (candleWidth >= 3) {
					_this.paper.rect(x, y1, candleWidth, height).attr({
						'fill': color,
						'stroke-width': 0
					});
				}

				// 上下影线
				var shadowX = px(x + round(candleWidth / 2));
				var pathString = createPathString({
					x: shadowX,
					y: px(scaleY(high))
				}, {
					x: shadowX,
					y: px(scaleY(low))
				});

				_this.shadowXList.push(shadowX);
				_this.paper.path(pathString).attr('stroke', color);
			});

			this.candleWidth = candleWidth;
			this.candleSpace = candleSpace;
			this.candleY = scaleY;
			this.candleSet = this.paper.setFinish();

			this.drawPolyline();
			this.hidePolySet();
		},
		drawVolumes: function drawVolumes() {
			var _this2 = this;

			var round = Math.round;
			// 量线，绘制量柱
			var volX = 0;
			var volY = this.height + FONT_SIZE + TEXT_MARGIN * 2; // 加文字高度
			var volWidth = this.width;
			var volHeight = VOL_HEIGHT;
			var candleData = this.candleData;
			var candleWidth = this.candleWidth,
			    candleSpace = this.candleSpace;

			// 量图边框

			this.paper.rect(px(volX), px(volY), volWidth, volHeight - 1).attr('stroke', STROKE_COLOR);

			var maxVol = candleData.reduce(function (prev, curr) {
				return Math.max(curr.volume, prev);
			}, candleData[0].volume);
			var minVol = candleData.reduce(function (prev, curr) {
				return Math.min(curr.volume, prev);
			}, candleData[0].volume);
			var volScale = scaleLinear().domain([minVol, maxVol]).rangeRound([0, volHeight]);

			// 量柱横向辅助线
			var helperLineY = this.height + FONT_SIZE + TEXT_MARGIN * 2 + (volHeight >> 1);
			var p1 = {
				x: px(0),
				y: px(helperLineY)
			};
			var p2 = {
				x: px(this.width),
				y: px(helperLineY)
			};
			this.paper.path(createPathString(p1, p2)).attr({
				stroke: STROKE_COLOR
			});

			var arr = [minVol, (maxVol + minVol) / 2, maxVol];
			var offsetY = this.height + TEXT_MARGIN * 2 + FONT_SIZE;
			var paper = this.paper;
			for (var i = 0; i < 3; i++) {
				var txt = paper.text(0, 0, UnitUtil.million(arr[i])).attr('fill', '#999999');
				var box = txt.getBBox();
				var x = this.width + TEXT_MARGIN + box.width / 2;
				var y = offsetY + volHeight - volHeight / 2 * i;

				if (i === 0) {
					y -= box.height / 2;
				} else if (i === 2) {
					y += box.height / 2;
				}

				txt.attr({
					x: x,
					y: y
				});
			}

			// 量柱
			candleData.forEach(function (item, index, arr) {
				var x = OUTTER_MARGIN + round(index * (candleWidth + candleSpace));
				var h = volScale(item.volume);
				var y = _this2.height + FONT_SIZE + TEXT_MARGIN * 2 + volHeight - h;
				var open = item.open,
				    close = item.close;

				var color = void 0;

				if (open > close) {
					color = LOSS_COLOR;
				} else if (open < close) {
					color = WIN_COLOR;
				} else {
					color = EQUAL_COLOR;
				}

				_this2.paper.rect(x, y, candleWidth, h).attr({
					fill: color,
					'stroke-width': 0
				});
			});

			return true;
		},
		createTooltip: function createTooltip() {
			var tooltip = $('<div>').css({
				position: 'absolute',
				top: 10
			});

			if (this.options.tooltip.className) {
				tooltip.addClass(this.options.tooltip.className);
			}

			return tooltip;
		},
		getTooltipHtml: function getTooltipHtml(data, index) {
			var fn = this.options.tooltip.fn;
			var html = '';

			if (fn) {
				html = fn(data, index);
			}

			return html;
		},
		createEventLayerNormal: function createEventLayerNormal() {
			var _this3 = this;

			var elem = $('<div>').css({
				position: 'absolute',
				left: 0,
				top: 0,
				width: this.chartWidth,
				height: this.chartHeight
			});

			$(this.container).css({
				position: 'relative'
			}).append(elem);

			var offset = elem.offset();
			var paper = new Raphel(elem[0], this.chartWidth, this.chartHeight);
			var scaleLeft;
			var floatLine;
			var tooltip;

			var line = function line(x, y) {
				if (!floatLine) {
					floatLine = paper.path(createPathString({
						x: px(x),
						y: px(0)
					}, {
						x: px(x),
						y: px(y)
					})).attr({
						stroke: STROKE_COLOR
					});
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
				});
			};

			elem.on('mouseenter', function (e) {
				if (scaleLeft === undefined) {
					scaleLeft = scaleLinear().domain([0, _this3.width]).rangeRound([0, _this3.shadowXList.length - 1]);
				}

				if (tooltip === undefined) {
					tooltip = _this3.createTooltip();

					_this3.eventLayer.append(tooltip);
				}
			});

			elem.on('mousemove', function (e) {
				if (_this3.shadowXList === undefined) {
					return;
				}

				var x = e.pageX - offset.left;
				var index = scaleLeft(x);
				var x = _this3.shadowXList[index];
				var item;
				var top;

				if (x === undefined) {
					return;
				}

				var y = _this3.needVolume ? _this3.height + FONT_SIZE + VOL_HEIGHT : _this3.height;
				line(x, y);

				item = _this3.candleData[index];
				top = _this3.closeYList[index];

				if (x >= _this3.width - tooltip.width()) {
					tooltip.css({
						'top': top,
						'left': '',
						'right': _this3.chartWidth - _this3.width + 5
					});
				} else {
					tooltip.css({
						'top': top,
						'left': x + 5,
						'right': ''
					});
				}

				tooltip.html(_this3.getTooltipHtml(item, index));
			});

			elem.on('mouseleave', function (e) {
				scaleLeft = undefined;
				floatLine = undefined;
				paper.clear();
				tooltip.remove();
				tooltip = undefined;
			});

			this.eventLayer = elem;
		},
		createEventLayer: function createEventLayer() {
			var _this4 = this;

			var layerWidth = this.chartWidth - this.yAxisTextWidth;
			var elem = $('<div>').css({
				position: 'absolute',
				left: 0,
				top: 0,
				width: layerWidth,
				height: this.chartHeight
			});

			$(this.container).css({
				position: 'relative'
			}).append(elem);

			var offset = elem.offset();
			var paper = new Raphel(elem[0], layerWidth, this.chartHeight);
			var scaleLeft;
			var scaleRight;
			var floatLine;
			var tooltip;

			$(window).on('resize', function (e) {
				offset = elem.offset();
			});

			var line = function line(x, y) {
				if (!floatLine) {
					floatLine = paper.path(createPathString({
						x: px(x),
						y: px(0)
					}, {
						x: px(x),
						y: px(y)
					})).attr({
						stroke: STROKE_COLOR
					});
				}

				floatLine.attr({
					path: createPathString({
						x: px(x),
						y: px(0)
					}, {
						x: px(x),
						y: px(y)
					}),
					stroke: '#aeaeae'
				});
			};

			elem.on('mouseenter', function (e) {
				if (scaleLeft === undefined) {
					scaleLeft = scaleLinear().domain([0, _this4.offset]).rangeRound([0, _this4.shadowXList.length - 1]);

					if (_this4.predictXList) {
						scaleRight = scaleLinear().domain([_this4.offset, _this4.width]).rangeRound([0, _this4.predictXList.length - 1]);
					}
				}

				if (tooltip === undefined) {
					tooltip = _this4.createTooltip();

					_this4.eventLayer.append(tooltip);
				}
			}).on('mousemove', function (e) {
				if (_this4.shadowXList === undefined) {
					return;
				}

				var x = e.pageX - offset.left;
				var item;
				var top;

				if (x < _this4.offset) {
					var index = scaleLeft(x);
					var x = _this4.shadowXList[index];

					if (x === undefined) {
						return;
					}

					line(x, _this4.needVolume ? _this4.chartHeight : _this4.height);

					item = _this4.candleData[index];
					top = _this4.closeYList[index];

					tooltip.html(_this4.getTooltipHtml(item, 'normal'));
				} else {
					if (_this4.predictXList === undefined) {
						return;
					}

					var index = scaleRight(x);

					if (index === 0) {
						return;
					}

					if (index >= _this4.predictXList.length) {
						return;
					}

					var x = _this4.predictXList[index];

					line(x, _this4.needVolume ? _this4.chartHeight : _this4.height);
					item = _this4.predictData[index];
					top = _this4.predictCloseYList[index];

					tooltip.html(_this4.getTooltipHtml(item, 'predict'));
				}

				// console.log(x, this.width, tooltip.width())

				if (x >= _this4.width - tooltip.width()) {
					tooltip.css({
						'top': top,
						'left': '',
						'right': layerWidth - _this4.width + 5
					});
				} else {
					tooltip.css({
						'top': top,
						'left': x + 5,
						'right': ''
					});
				}
			}).on('mouseleave', function (e) {
				console.log('mouseleave fire');
				scaleLeft = undefined;
				scaleRight = undefined;
				floatLine = undefined;
				paper.clear();
				tooltip.remove();
				tooltip = undefined;
			});

			this.eventLayer = elem;
		},

		hideCandleSet: function hideCandleSet() {
			if (this.candleSet) {
				this.candleSet.hide();
			}
		},

		showCandleSet: function showCandleSet() {
			this.candleSet.show();
		},

		hidePolySet: function hidePolySet() {
			if (this.polySet) {
				this.polySet.hide();
			}
		},

		showPolySet: function showPolySet() {
			this.polySet.show();
		},
		// 收盘价折线
		drawPolyline: function drawPolyline() {
			var _this5 = this;

			this.paper.setStart();

			var points = this.candleData.map(function (item, i, arr) {
				var x = _this5.shadowXList[i];
				var y = _this5.candleY(_this5.candleData[i].close);

				if (i === 0) {
					x = 0;
				} else if (i === arr.length - 1) {
					x = _this5.offset;
				}

				return {
					x: px(x),
					y: px(y)
				};
			});

			this.paper.path(createPathString.apply(undefined, _toConsumableArray(points))).attr({
				stroke: '#297cda',
				'stroke-width': 2
			});

			this.polySet = this.paper.setFinish();
		},
		clear: function clear() {
			this.candleSet && this.candleSet.clear();
			this.polySet && this.polySet.clear();

			if (this.eventLayer) {
				this.eventLayer.off().remove();
			}
			this.paper.clear();
		},
		update: function update(_ref) {
			var candleData = _ref.candleData,
			    predictData = _ref.predictData,
			    cycle = _ref.cycle;

			this.clear();

			if (candleData !== undefined) {
				this.candleData = candleData.map(str2number);
			}

			if (predictData !== undefined) {
				this.predictData = predictData.map(str2number);
			}

			if (cycle !== undefined) {
				this.cycle = cycle;
			}

			this.draw();
		}
	};

	module.exports = ChartPrototype;

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = window.$;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	/**
	 * Created by shinan on 2016/12/6.
	 */

	var UnitUtil = {
	  millionBillion: function millionBillion(n) {
	    var a = [[1e4, '万'], [1e8, '亿']];

	    for (var i = a.length - 1; i >= 0; i--) {
	      var _a$i = _slicedToArray(a[i], 2),
	          size = _a$i[0],
	          unit = _a$i[1];

	      if (n > size) {
	        var ret = (n / size).toFixed(2);

	        if (i == 0) {
	          ret = parseInt(ret);
	        }

	        return ret + unit;
	      }
	    }

	    return n;
	  },
	  million: function million(n) {
	    var ret = parseInt(n / 1e4);

	    return ret + '\u4E07';
	  }
	};

	module.exports = UnitUtil;

/***/ }
/******/ ]);