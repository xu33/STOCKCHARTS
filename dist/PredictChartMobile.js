var PredictChartMobile =
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

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _config = __webpack_require__(5);

	__webpack_require__(11);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by shinan on 2016/12/29.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var str2number = __webpack_require__(1);
	var d3 = __webpack_require__(15);
	var PREDICT_PERCENT = 0.7;
	var MARGIN_BOTTOM = 15;
	var MARGIN_RIGHT = 2;
	var TEXT_MARGIN = 5;
	var VOL_HEIGHT = 66;
	var EventEmitter = __webpack_require__(16);

	var Predict = function (_EventEmitter) {
	  _inherits(Predict, _EventEmitter);

	  function Predict(selector, options) {
	    _classCallCheck(this, Predict);

	    var _this = _possibleConstructorReturn(this, (Predict.__proto__ || Object.getPrototypeOf(Predict)).call(this));

	    _this.options = options;

	    _this.svg = d3.select(selector).append('svg').attr('width', options.width).attr('height', options.height);

	    _this.totalHeight = _this.options.height;
	    _this.candleStickAreaHeight = options.height - MARGIN_BOTTOM;
	    _this.options.width = options.width - MARGIN_RIGHT;

	    if (_this.options.volume) {
	      _this.candleStickAreaHeight -= VOL_HEIGHT;
	    }

	    _this.options.candleData = _this.options.candleData.map(str2number);
	    _this.options.predictData = _this.options.predictData.map(str2number);

	    var candleData = options.candleData,
	        predictData = options.predictData;

	    var all = candleData.concat(predictData);

	    var min = d3.min(all, function (d) {
	      return +d.low;
	    });
	    var max = d3.max(all, function (d) {
	      return +d.high;
	    });

	    min = min - min / 50;
	    max = max + max / 50;

	    var scaleY = d3.scaleLinear().domain([min, max]).range([_this.candleStickAreaHeight, 0]);

	    _this.min = min;
	    _this.max = max;
	    _this.scaleY = scaleY;
	    _this.render();
	    return _this;
	  }

	  // 预测线


	  _createClass(Predict, [{
	    key: 'predictLines',
	    value: function predictLines() {
	      var svg = this.svg,
	          scaleY = this.scaleY;
	      var _options = this.options,
	          width = _options.width,
	          candleData = _options.candleData,
	          predictData = _options.predictData;

	      var height = this.candleStickAreaHeight;
	      var offset = width * PREDICT_PERCENT;
	      var g = svg.append('g').attr('transform', 'translate(' + offset + ', 0)');
	      // 预测部分虚框
	      var area = d3.area().x(function (d) {
	        return d.x;
	      }).y0(0).y1(function (d) {
	        return d.y;
	      });

	      g.append('path').datum([{
	        x: 0,
	        y: height
	      }, {
	        x: width * (1 - PREDICT_PERCENT),
	        y: height
	      }]).attr('d', area).attr('class', 'predict');

	      var last = candleData[candleData.length - 1];

	      predictData.unshift({
	        high: last.close,
	        low: last.close,
	        close: last.close
	      });

	      // 预测部分折线
	      var scaleX = d3.scaleLinear().domain([0, predictData.length - 1]).range([0, width * (1 - PREDICT_PERCENT)]);

	      this.predictScaleX = scaleX;

	      var lineCeil = d3.line().y(function (d) {
	        return scaleY(d.high);
	      }).x(function (d, i) {
	        return scaleX(i);
	      });

	      g.append('path').datum(predictData).attr('class', 'ceil').attr('d', lineCeil);

	      var lineProfit = d3.line().y(function (d) {
	        return scaleY(d.close);
	      }).x(function (d, i) {
	        return scaleX(i);
	      });

	      g.append('path').datum(predictData).attr('class', 'profit').attr('d', lineProfit);

	      var lineFlor = d3.line().y(function (d) {
	        return scaleY(d.low);
	      }).x(function (d, i) {
	        return scaleX(i);
	      });

	      g.append('path').datum(predictData).attr('class', 'flor').attr('d', lineFlor);

	      // 分割虚线
	      var helpLine = d3.line().y(function (d) {
	        return d.y;
	      }).x(function (d) {
	        return d.x;
	      });

	      g.append('path').datum([{
	        x: 0,
	        y: 0
	      }, {
	        x: 0,
	        y: this.options.volume ? this.totalHeight : height
	      }]).attr('d', helpLine).attr('stroke', '#ccc').attr("stroke-dasharray", '5, 3');
	    }

	    // 蜡烛线

	  }, {
	    key: 'candleSticks',
	    value: function candleSticks() {
	      var svg = this.svg,
	          scaleY = this.scaleY;
	      var _options2 = this.options,
	          width = _options2.width,
	          candleData = _options2.candleData;

	      var height = this.candleStickAreaHeight;
	      var offset = width * PREDICT_PERCENT;
	      var scaleX = d3.scaleBand().domain(candleData.map(function (o, i) {
	        return i;
	      })).range([0, offset]).padding(0.4);

	      this.scaleBandX = scaleX;

	      var group = svg.append('g').attr('class', 'candles');
	      group.selectAll('rect').data(candleData).enter().append('rect').attr('class', 'bar').attr('x', function (d, i) {
	        return scaleX(i);
	      }).attr('y', function (d) {
	        return scaleY(Math.max(d.open, d.close));
	      }).attr('width', scaleX.bandwidth()).attr('height', function (d) {
	        var h = scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close));
	        if (h < 1) {
	          h = 1;
	        }

	        return h;
	      }).attr('fill', function (d) {
	        return d.close > d.open ? _config.WIN_COLOR : _config.LOSS_COLOR;
	      });

	      var line = d3.line().x(function (d) {
	        return d.x;
	      }).y(function (d) {
	        return d.y;
	      });
	      group.selectAll('path.shadow').data(candleData).enter().append('path').attr('class', 'shadow').attr('d', function (d, i) {
	        var x = scaleX(i) + scaleX.bandwidth() / 2;
	        var y1 = scaleY(d.high);
	        var y2 = scaleY(d.low);

	        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
	      }).attr('stroke', function (d) {
	        return d.close > d.open ? _config.WIN_COLOR : _config.LOSS_COLOR;
	      });

	      this.candleGroup = group;
	    }

	    // 量线

	  }, {
	    key: 'volumes',
	    value: function volumes() {
	      var svg = this.svg;
	      var _options3 = this.options,
	          width = _options3.width,
	          candleData = _options3.candleData;

	      var height = this.candleStickAreaHeight;
	      var min = d3.min(candleData, function (d) {
	        return d.volume;
	      });
	      var max = d3.max(candleData, function (d) {
	        return d.volume;
	      });

	      // 增加一些
	      max += max / 10;

	      var VOL_HEIGHT = 66;
	      var offset = width * PREDICT_PERCENT;
	      var scaleY = d3.scaleLinear().domain([min, max]).range([VOL_HEIGHT, 0]);
	      var group = svg.append('g').attr('transform', 'translate(0, ' + (height + MARGIN_BOTTOM - 1) + ')');

	      group.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', VOL_HEIGHT).attr('class', 'volume');

	      var scaleX = this.scaleBandX;
	      group.selectAll('.bar').data(candleData).enter().append('rect').attr('class', 'bar').attr('x', function (d, i) {
	        return scaleX(i);
	      }).attr('y', function (d) {
	        return scaleY(d.volume);
	      }).attr('width', scaleX.bandwidth()).attr('height', function (d) {
	        return VOL_HEIGHT - scaleY(d.volume);
	      }).attr('fill', function (d) {
	        return d.open > d.close ? _config.WIN_COLOR : _config.LOSS_COLOR;
	      });

	      group.selectAll('.bar').data(candleData).enter().append('rect').attr('class', 'bar');
	    }

	    // 数轴&辅助线

	  }, {
	    key: 'axis',
	    value: function axis() {
	      var svg = this.svg,
	          scaleY = this.scaleY;
	      var _options4 = this.options,
	          width = _options4.width,
	          candleData = _options4.candleData,
	          predictData = _options4.predictData;

	      var height = this.candleStickAreaHeight;
	      var offset = width * PREDICT_PERCENT;

	      var scaleXReal = d3.scaleOrdinal().domain([candleData[0].time, candleData[candleData.length - 1].time, predictData[predictData.length - 1].time]).range([0, offset, width]);

	      var min = this.min,
	          max = this.max;

	      min = +min;
	      max = +max;
	      var scaleYReal = d3.scaleOrdinal().domain([min, (max + min) / 2, max]).range([height, height / 2, 0]);

	      // 底部X轴
	      var axisX = d3.axisBottom(scaleXReal).tickSize(0).tickPadding(TEXT_MARGIN);
	      // 右侧Y轴
	      var axisY = d3.axisLeft(scaleYReal).tickSize(0).tickPadding(TEXT_MARGIN).tickFormat(function (d) {
	        return Number(d).toFixed(2);
	      });
	      // 顶部X轴（辅助线）
	      var topAxis = d3.axisBottom(scaleXReal).tickSize(0).tickFormat('');
	      // 左侧Y轴
	      var leftAxis = d3.axisRight(scaleYReal).tickSize(width).tickFormat('');

	      svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, 0)').call(topAxis);
	      var leftAxisElement = svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, 0)').call(leftAxis);

	      var axisXElement = svg.append('g').attr('class', 'axis').attr('transform', 'translate(0, ' + height + ')').call(axisX);
	      var axisYElement = svg.append('g').attr('class', 'axis').attr('transform', 'translate(' + width + ', 0)').call(axisY);

	      axisXElement.selectAll('.tick text').attr('text-anchor', 'end');

	      // 偏移数轴第一个刻度值
	      axisXElement.select('.tick text').attr('text-anchor', 'start');
	      // 偏移第二个刻度值 防止贴辅助线太紧
	      // axisXElement.selectAll('.tick text').select(function(d, i) {
	      //   if (i == 1) {
	      //     return this
	      //   }
	      // }).attr('transform', `translate(-2, 0)`)

	      axisYElement.selectAll('.tick text').each(function (d, i) {
	        if (i == 2) {
	          d3.select(this).attr('transform', 'translate(0, 10)');
	        } else {
	          d3.select(this).attr('transform', 'translate(0, -10)');
	        }
	      });

	      // 纵向辅助线改为虚线
	      var selection = leftAxisElement.selectAll('.tick line');
	      selection.each(function (d, i) {
	        if (i != 0 || i != selection.length - 1) {
	          d3.select(this).attr("stroke-dasharray", '5, 3');
	        }
	      });
	    }

	    /* 显示折线 */

	  }, {
	    key: 'drawPolyline',
	    value: function drawPolyline() {
	      var _options5 = this.options,
	          candleData = _options5.candleData,
	          width = _options5.width;

	      var scaleX = d3.scaleLinear().domain([0, candleData.length - 1]).range([0, width * PREDICT_PERCENT]);
	      var scaleY = this.scaleY;
	      var line = d3.line().x(function (d, i) {
	        return scaleX(i);
	      }).y(function (d) {
	        return scaleY(d.close);
	      });

	      var group = this.svg.append('g').attr('class', 'poly');

	      group.append('path').datum(candleData).attr('d', line).attr('stroke', '#297cda').attr('stroke-width', 2).attr('fill', 'none');

	      this.lineGroup = group;
	    }
	  }, {
	    key: 'togglePoly',
	    value: function togglePoly(bool) {
	      if (!this.lineGroup) {
	        this.drawPolyline();
	      } else {
	        this.lineGroup.attr('class', bool ? 'poly' : 'none');
	      }
	    }
	  }, {
	    key: 'toggleCandle',
	    value: function toggleCandle(bool) {
	      this.candleGroup.attr('class', bool ? 'candle' : 'none');
	    }
	  }, {
	    key: 'events',
	    value: function events() {
	      var _this2 = this;

	      var drag = d3.drag().container(function () {
	        return this;
	      }).on('start', function () {
	        _this2.handleDragStart(d3.event.x, d3.event.y);
	      }).on('drag', function () {
	        _this2.handleDragMove(d3.event.x, d3.event.y);
	      }).on('end', function () {
	        _this2.handleDragEnd();
	      });

	      this.svg.call(drag);
	    }
	  }, {
	    key: 'getHelperLineXY',
	    value: function getHelperLineXY(x) {
	      var _options6 = this.options,
	          candleData = _options6.candleData,
	          predictData = _options6.predictData,
	          width = _options6.width;
	      var scaleBandX = this.scaleBandX,
	          scaleY = this.scaleY,
	          predictScaleX = this.predictScaleX;


	      var offset = this.options.width * PREDICT_PERCENT;

	      if (x > offset) {
	        var step = width * (1 - PREDICT_PERCENT) / predictData.length;
	        var relX = x - offset;
	        var index = Math.ceil(relX / step);

	        if (index < 0 || index >= predictData.length) {
	          return { x: -1, y: -1, index: index };
	        }

	        var lineX = offset + predictScaleX(index);
	        var lineY = scaleY(predictData[index].close);

	        return {
	          x: lineX,
	          y: lineY,
	          point: predictData[index]
	        };
	      } else {
	        var _step = scaleBandX.step();
	        var _index = Math.floor(x / _step);

	        if (_index < 0 || _index >= candleData.length) {
	          return { x: -1, y: -1, index: _index };
	        }

	        var bandWidth = scaleBandX.bandwidth();
	        var _lineX = scaleBandX(_index) + bandWidth / 2;
	        var _lineY = scaleY(candleData[_index].close);

	        return { x: _lineX, y: _lineY, point: candleData[_index] };
	      }
	    }
	  }, {
	    key: 'handleDragStart',
	    value: function handleDragStart(x) {
	      var _getHelperLineXY = this.getHelperLineXY(x),
	          x = _getHelperLineXY.x,
	          y = _getHelperLineXY.y,
	          point = _getHelperLineXY.point;

	      if (x === -1) return;

	      var hData = [{
	        x: 0,
	        y: y
	      }, {
	        x: this.options.width,
	        y: y
	      }];

	      var vData = [{
	        x: x,
	        y: 0
	      }, {
	        x: x,
	        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
	      }];

	      var line = d3.line().x(function (d) {
	        return d.x;
	      }).y(function (d) {
	        return d.y;
	      });

	      var horizontalLine = this.svg.append('path');
	      var verticalLine = this.svg.append('path');

	      horizontalLine.datum(hData).attr('d', line).attr('class', 'help');
	      verticalLine.datum(vData).attr('d', line).attr('class', 'help');

	      this.horizontalLine = horizontalLine;
	      this.verticalLine = verticalLine;

	      this.emit('drag-start', point);
	    }
	  }, {
	    key: 'handleDragMove',
	    value: function handleDragMove(x) {
	      var _getHelperLineXY2 = this.getHelperLineXY(x),
	          x = _getHelperLineXY2.x,
	          y = _getHelperLineXY2.y,
	          point = _getHelperLineXY2.point;

	      if (x === -1) return;

	      var hData = [{
	        x: 0,
	        y: y
	      }, {
	        x: this.options.width,
	        y: y
	      }];

	      var vData = [{
	        x: x,
	        y: 0
	      }, {
	        x: x,
	        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
	      }];

	      var line = d3.line().x(function (d) {
	        return d.x;
	      }).y(function (d) {
	        return d.y;
	      });

	      this.horizontalLine.datum(hData).attr('d', line);
	      this.verticalLine.datum(vData).attr('d', line);

	      this.emit('drag-move', point);
	    }
	  }, {
	    key: 'handleDragEnd',
	    value: function handleDragEnd() {
	      if (this.horizontalLine || this.verticalLine) {
	        this.horizontalLine.remove();
	        this.verticalLine.remove();
	      }

	      this.emit('drag-end');
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _options7 = this.options,
	          volume = _options7.volume,
	          interactive = _options7.interactive;


	      this.candleSticks();
	      this.predictLines();
	      this.axis();

	      if (volume) {
	        this.volumes();
	      }

	      if (interactive) {
	        this.events();
	      }
	    }
	  }]);

	  return Predict;
	}(EventEmitter);

	module.exports = Predict;

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
/* 2 */,
/* 3 */,
/* 4 */,
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
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(12);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(14)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./d3.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./d3.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, "* {\r\n    margin:0;\r\n    padding:0;\r\n}\r\n\r\n/*svg {\r\n    margin-left:10px;\r\n    margin-top:10px;\r\n}*/\r\n\r\nsvg * {\r\n    shape-rendering:crispEdges;\r\n}\r\n\r\n/* 数字文字颜色 */\r\n.axis text {\r\n    fill: #999999;\r\n}\r\n\r\n/* 数轴颜色 */\r\n.axis path {\r\n    stroke: #ccc;\r\n}\r\n\r\n.shadow {\r\n    stroke-width: 1px;\r\n    fill: none;\r\n}\r\n\r\n.tick line {\r\n    stroke: #ccc;\r\n}\r\n\r\n.predict {\r\n    fill: #e7f2fc;\r\n    fill-opacity: 0.6;\r\n}\r\n\r\n.ceil, .flor, .profit {\r\n    shape-rendering: auto;\r\n}\r\n\r\n.ceil, .flor {\r\n    stroke: #80b5ff;\r\n    fill: none;\r\n}\r\n\r\n.profit {\r\n    stroke: #e63232;\r\n    fill: none;\r\n}\r\n\r\n.volume {\r\n    stroke: #ccc;\r\n    fill: none;\r\n}\r\n\r\n.none {\r\n    display: none;\r\n}\r\n\r\n.poly path {\r\n    shape-rendering: auto;\r\n}\r\n\r\n/* 参考线 */\r\n.help {\r\n    stroke: #d8d8d8;\r\n}", ""]);

	// exports


/***/ },
/* 13 */
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
/* 14 */
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
/* 15 */
/***/ function(module, exports) {

	module.exports = window.d3;

/***/ },
/* 16 */
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