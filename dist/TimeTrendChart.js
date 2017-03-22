var TimeTrendChart =
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

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	__webpack_require__(1);

	var _getArrayBetween = __webpack_require__(5);

	var _getArrayBetween2 = _interopRequireDefault(_getArrayBetween);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var EventEmitter = __webpack_require__(7);
	var d3 = __webpack_require__(6);
	var VOL_RATIO = 0.3;
	var BOTTOM_MARGIN = 16;
	var AREA_STROKE_COLOR = '#4188bb';
	var AXIS_STROKE_COLOR = '#eeeeee';
	var RED = '#e94f69';
	var GREEN = '#139125';
	var UNKNOW = '#CCCCCC';
	var ORANGE = '#ec9e4a';
	var TOTAL_COUNT = 661;
	var TIMES = ['20:00', '0:00', '9:00', '13:30', '15:30'];

	var TimeTrendChart = function (_EventEmitter) {
	  _inherits(TimeTrendChart, _EventEmitter);

	  function TimeTrendChart(_ref) {
	    var width = _ref.width,
	        height = _ref.height,
	        container = _ref.container,
	        data = _ref.data;

	    _classCallCheck(this, TimeTrendChart);

	    var _this = _possibleConstructorReturn(this, (TimeTrendChart.__proto__ || Object.getPrototypeOf(TimeTrendChart)).call(this));

	    _this.element = d3.select(container);
	    _this.svg = _this.element.append('svg');
	    _this.svg.attr('width', width).attr('height', height);

	    _this.container = container;
	    _this.width = width;
	    _this.height = height;
	    _this.volHeight = height * VOL_RATIO;
	    _this.baseHeight = height - _this.volHeight - BOTTOM_MARGIN;
	    _this.data = data;
	    _this.render();
	    _this.initTouchEvents();
	    return _this;
	  }

	  _createClass(TimeTrendChart, [{
	    key: 'render',
	    value: function render() {
	      this.renderAxis();
	      this.renderArea();
	      this.renderVolumes();
	    }
	  }, {
	    key: 'renderAxis',
	    value: function renderAxis() {
	      this.createHorizontalAxis();
	      this.createVerticalAxis();
	    }

	    // 初始化事件处理

	  }, {
	    key: 'initTouchEvents',
	    value: function initTouchEvents() {
	      var svg = this.svg,
	          width = this.width,
	          height = this.height;

	      var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, width]);
	      var line = d3.line().x(function (d) {
	        return d.x;
	      }).y(function (d) {
	        return d.y;
	      });
	      var that = this;

	      var drawLine = function drawLine(data) {
	        var lines = svg.selectAll('.guide-line').data(data);

	        lines.enter().append('path').attr('class', 'guide-line').merge(lines).attr('d', line);

	        lines.exit().remove();
	      };
	      var handleTouch = function handleTouch() {
	        var _d3$touches = d3.touches(this),
	            _d3$touches2 = _slicedToArray(_d3$touches, 1),
	            _d3$touches2$ = _slicedToArray(_d3$touches2[0], 1),
	            x = _d3$touches2$[0];

	        var verticalGuideLineCoords = [{
	          x: x,
	          y: 0
	        }, {
	          x: x,
	          y: height
	        }];

	        var data = [verticalGuideLineCoords];

	        var index = Math.floor(scaleX.invert(x));

	        if (index < 0 || index >= that.data.length) {
	          return;
	        }

	        drawLine(data);

	        // 更新成交量文字
	        var datum = that.data[index];

	        that.volumeLeftAxisElement.select('.tick text').text('\u6210\u4EA4\u91CF:' + datum.volume);

	        that.emit('change', datum);
	      };

	      svg.on('touchstart', handleTouch).on('touchmove', handleTouch).on('touchend', function () {
	        var data = [];

	        drawLine(data);

	        that.updateVolumesYAxis();

	        that.emit('change', that.data[that.data.length - 1]);
	      });
	    }

	    // 创建水平数轴

	  }, {
	    key: 'createHorizontalAxis',
	    value: function createHorizontalAxis() {
	      var width = this.width,
	          baseHeight = this.baseHeight,
	          svg = this.svg;

	      var range = [0, width * 4 / 11, width * 6.5 / 11, width * 9 / 11, width];
	      var scale = d3.scaleOrdinal().domain(TIMES).range(range);

	      this.staticScale = scale;

	      var bottomAxis = d3.axisBottom(scale).tickSize(0).tickPadding(6);
	      var bottomAxisElement = svg.append('g').attr('class', 'chart-axis').attr('transform', 'translate(0, ' + baseHeight + ')');
	      bottomAxisElement.call(bottomAxis);

	      bottomAxisElement.selectAll('.tick text').attr('text-anchor', 'middle').attr('transform', function (d, i) {
	        if (i === TIMES.length - 1) {
	          return 'translate(-16, 0)';
	        } else if (i === 0) {
	          return 'translate(15, 0)';
	        }
	      });

	      // 辅助线
	      var topAxis = d3.axisBottom(scale).tickSize(baseHeight).tickFormat('');
	      svg.append('g').attr('class', 'chart-axis').attr('transform', 'translate(0, 0)').call(topAxis);
	    }

	    // 创建垂直数轴的刻度尺

	  }, {
	    key: 'createScaleForAxisY',
	    value: function createScaleForAxisY() {
	      var baseHeight = this.baseHeight;
	      var min = d3.min(this.data, function (d) {
	        return d.price;
	      });
	      var max = d3.max(this.data, function (d) {
	        return d.price;
	      });

	      var domain = (0, _getArrayBetween2.default)(min, max, 2);
	      var step = baseHeight / (domain.length - 1);
	      var range = domain.map(function (v, i) {
	        return step * i;
	      });
	      var scale = d3.scaleOrdinal().domain(domain.reverse()).range(range);

	      return scale;
	    }

	    // 创建垂直数轴

	  }, {
	    key: 'createVerticalAxis',
	    value: function createVerticalAxis() {
	      var svg = this.svg;
	      var leftAxisElement = svg.append('g').attr('class', 'chart-axis');
	      this.leftAxisElement = leftAxisElement;
	      this.updateYAxis();

	      // 辅助线
	      var step = this.baseHeight / 4;
	      var helpScale = d3.scaleOrdinal().domain([0, 1, 2, 3, 4]).range([0, step * 1, step * 2, step * 3, this.baseHeight]);
	      var rightAxis = d3.axisLeft(helpScale).tickSize(this.width).tickFormat('').ticks(4);
	      var rightAxisElement = svg.append('g').attr('class', 'chart-axis').attr('transform', 'translate(' + (this.width - 1) + ', 0)').call(rightAxis);

	      rightAxisElement.selectAll('.tick line').attr('stroke-dasharray', function (d, i) {
	        if (i == 1 || i == 3) return '10, 4';
	      });
	    }

	    // 更新左侧Y轴刻度

	  }, {
	    key: 'updateYAxis',
	    value: function updateYAxis() {
	      var scale = this.createScaleForAxisY();
	      var leftAxis = d3.axisRight(scale).tickSize(0).tickFormat(function (d) {
	        return parseInt(d);
	      });

	      this.leftAxisElement.call(leftAxis);

	      // 调整刻度位置
	      this.leftAxisElement.selectAll('.tick text').attr('transform', function (d, i, all) {
	        var offset = i == 0 ? 10 : i == all.length - 1 ? -10 : -10;

	        return 'translate(0, ' + offset + ')';
	      }).attr('fill', function (d, i, all) {
	        if (i == 0) return RED;
	        if (i == all.length - 1) return GREEN;
	        return '#777';
	      });

	      return scale;
	    }

	    // 绘制分时图

	  }, {
	    key: 'renderArea',
	    value: function renderArea() {
	      this.svg.append('g').attr('class', 'trend-area-wrap');
	      this.updateArea();
	    }

	    // 绘制量图

	  }, {
	    key: 'renderVolumes',
	    value: function renderVolumes() {
	      this.volumeWrapper = this.svg.append('g').attr('class', 'volume-wrap');
	      this.volumeWrapper.attr('transform', 'translate(0, ' + (this.baseHeight + BOTTOM_MARGIN) + ')');

	      // 绘制量图数轴
	      // 保存方便后续更新
	      this.volumeLeftAxisElement = this.volumeWrapper.append('g').attr('class', 'chart-axis');
	      this.updateVolumesYAxis();

	      // 量图垂直辅助线
	      var axisBottom = d3.axisTop(this.staticScale).tickSize(this.volHeight - 21).tickFormat('');
	      var axisBottomElement = this.volumeWrapper.append('g').attr('transform', 'translate(0, ' + (this.volHeight - 1) + ')').attr('class', 'chart-axis').call(axisBottom);

	      var axisTop = d3.axisBottom(this.staticScale).tickSize(0).tickFormat('');
	      var axisTopElement = this.volumeWrapper.append('g').attr('class', 'chart-axis').call(axisTop);
	      this.updateVolumes();

	      // 量图水平辅助线'
	      var min = 0;
	      var max = d3.max(this.data, function (d) {
	        return d.volume;
	      });

	      var scale = d3.scaleOrdinal().domain(['\u6210\u4EA4\u91CF:' + max, max, 0]).range([0, 20, this.volHeight]);
	      var axisLeft = d3.axisLeft(scale).tickSize(this.width);
	      var axisLeftElement = this.volumeWrapper.append('g').attr('class', 'chart-axis').attr('transform', 'translate(' + (this.width - 1) + ', 0)').call(axisLeft);
	    }

	    // 声明量图绘制过程

	  }, {
	    key: 'updateVolumes',
	    value: function updateVolumes() {
	      var _this2 = this;

	      var min = 0;
	      var max = d3.max(this.data, function (d) {
	        return d.volume;
	      });
	      var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, this.width]);
	      var scaleY = d3.scaleLinear().domain([min, max]).range([this.volHeight, 20]);

	      var data = this.data.map(function (_ref2, i) {
	        var volume = _ref2.volume;

	        var x0 = scaleX(i);
	        var y0 = scaleY(volume);

	        return [{
	          x: x0,
	          y: y0
	        }, {
	          x: x0,
	          y: _this2.volHeight
	        }];
	      });

	      var vols = this.volumeWrapper.selectAll('.vol').data(data);
	      var prices = this.data.map(function (o) {
	        return o.price;
	      });
	      var line = d3.line().x(function (d) {
	        return d.x;
	      }).y(function (d) {
	        return d.y;
	      });

	      vols.enter().append('path').attr('class', 'vol').merge(vols).attr('d', line).attr('stroke', function (d, i) {
	        if (i === 0) {
	          return UNKNOW;
	        }

	        // return prices[i] > prices[i - 1] ? RED : prices[i] == prices[i - 1] ? UNKNOW : GREEN
	        return prices[i] > prices[i - 1] ? RED : GREEN;
	      });

	      vols.exit().remove();
	    }

	    // 更新Y轴

	  }, {
	    key: 'updateVolumesYAxis',
	    value: function updateVolumesYAxis() {
	      var min = 0;
	      var max = d3.max(this.data, function (d) {
	        return d.volume;
	      });
	      var scale = d3.scaleOrdinal().domain(['\u6210\u4EA4\u91CF:' + max, max, 0]).range([0, 20, this.volHeight]);
	      var axis = d3.axisRight(scale).tickSize(0);
	      this.volumeLeftAxisElement.call(axis);

	      this.volumeLeftAxisElement.selectAll('.tick text').attr('transform', 'translate(0, 10)').attr('fill', ORANGE);
	    }

	    // 声明分时绘制过程

	  }, {
	    key: 'updateArea',
	    value: function updateArea() {
	      var baseHeight = this.baseHeight;
	      var svg = this.svg;
	      var min = d3.min(this.data, function (d) {
	        return d.price;
	      });
	      var max = d3.max(this.data, function (d) {
	        return d.price;
	      });
	      var scaleX = d3.scaleLinear().domain([0, TOTAL_COUNT]).range([0, this.width]);
	      var scaleY = d3.scaleLinear().domain([min, max]).range([baseHeight, 10]);

	      var areaElement = this.svg.select('.trend-area-wrap');

	      var line = d3.line().x(function (d, i) {
	        return scaleX(i);
	      }).y(function (d, i) {
	        return scaleY(d.price);
	      });

	      var area = d3.area().x(function (d, i) {
	        return scaleX(i);
	      }).y0(function (d, i) {
	        return scaleY(d.price);
	      }).y1(baseHeight);

	      var trendLine = areaElement.selectAll('.trend-line').data([this.data]);

	      trendLine.exit().remove();

	      trendLine.enter().append('path').attr('class', 'trend-line').merge(trendLine).attr('d', line).attr('fill', 'none').attr('stroke', AREA_STROKE_COLOR);

	      var trendArea = areaElement.selectAll('.trend-area').data([this.data]);

	      trendArea.exit().remove();

	      trendArea.enter().append('path').attr('class', 'trend-area').merge(trendArea).attr('d', area).attr('fill', AREA_STROKE_COLOR).attr('opacity', '0.3');
	    }
	  }, {
	    key: 'update',
	    value: function update(data) {
	      this.data = data;
	      this.updateArea();
	      this.updateYAxis();

	      this.updateVolumes();
	      this.updateVolumesYAxis();
	    }
	  }]);

	  return TimeTrendChart;
	}(EventEmitter);

	module.exports = TimeTrendChart;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "/* 数轴颜色 */\r\n.chart-axis path {\r\n    stroke: #d4d4d4;\r\n}\r\n\r\n.chart-axis line {\r\n    stroke: #d4d4d4;\r\n    /*shape-rendering:crispEdges;*/\r\n}\r\n\r\n.guide-line {\r\n    stroke: #555;\r\n}\r\n\r\n.guide-line, .candle, .shadow, .volume {\r\n    /*shape-rendering:crispEdges;*/\r\n}", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Created by 99171 on 2017/3/16.
	 */
	var d3 = __webpack_require__(6);
	var getArrayBetween = function getArrayBetween(startValue, endValue, length) {
	  var interpolater = d3.interpolateNumber(startValue, endValue);
	  var result = [];
	  for (var i = 0; i <= length; i++) {
	    result.push(interpolater(i / length));
	  }

	  return result;
	};

	exports.default = getArrayBetween;

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = window.d3;

/***/ },
/* 7 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }
/******/ ]);