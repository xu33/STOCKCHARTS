window["LineChart"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LineChart = function () {
  function LineChart(container, options) {
    _classCallCheck(this, LineChart);

    this.container = d3.select(container);
    this.svg = this.container.append('svg');
    this.options = _extends({}, LineChart.defaultOptions, options);

    var _options = this.options,
        containerWidth = _options.containerWidth,
        containerHeight = _options.containerHeight;
    var _options$margin = this.options.margin,
        left = _options$margin.left,
        right = _options$margin.right,
        bottom = _options$margin.bottom,
        top = _options$margin.top;


    this.svg.attr('width', containerWidth).attr('height', containerHeight);
    this.chartGroup = this.svg.append('g').attr('transform', 'translate(' + left + ', ' + top + ')');
    this.chartWidth = containerWidth - left - right;
    this.chartHeight = containerHeight - top - bottom;
    this.data = options.data;

    this.render();
  }

  _createClass(LineChart, [{
    key: 'render',
    value: function render() {
      this.initScale();
      this.renderChart();
      this.renderAxis();
      this.initCrosshair();
      this.createEventOverlay();
    }
  }, {
    key: 'renderAxis',
    value: function renderAxis() {
      this.renderLeftAxis();
      this.renderBottomAxis();
    }
  }, {
    key: 'createEventOverlay',
    value: function createEventOverlay() {
      var tooltip = this.options.tooltip;

      var div = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none');
      var crosshair = this.crosshair;
      var bisect = d3.bisector(function (d) {
        return d.date;
      }).left;
      var that = this;

      this.chartGroup.append('rect').attr('class', 'overlay').attr('width', this.chartWidth).attr('height', this.chartHeight).on('mouseover', function () {
        div.style('display', null);
        crosshair.style('display', null);
      }).on('mousemove', function () {
        var scaleX = that.scaleX,
            scaleY = that.scaleY,
            domainX = that.domainX,
            domainY = that.domainY,
            domainYFix = that.domainYFix,
            data = that.data;

        var mouseDate = scaleX.invert(d3.mouse(this)[0]);
        var index = bisect(data, mouseDate); // 返回当前这个数据项的索引

        // console.log(`index:${index}`);

        var d0 = data[index - 1];
        var d1 = data[index];
        var d = void 0;
        if (!d0) {
          d = d1;
        } else {
          d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
        }

        var x = scaleX(d.date);
        var y = scaleY(d.urRatio);

        div.html(tooltip(d));
        div.style('left', d3.event.pageX + 10 + 'px');
        div.style('top', d3.event.pageY - 10 + 'px');

        crosshair.select('#crossLineX').attr('x1', x).attr('y1', 0).attr('x2', x).attr('y2', that.chartHeight);

        crosshair.select('#crossLineY').attr('x1', 0).attr('y1', y).attr('x2', that.chartWidth).attr('y2', y);

        crosshair.select('#crossCenter').attr('cx', x).attr('cy', y);
      }).on('mouseout', function () {
        div.style('display', 'none');
        crosshair.style('display', 'none');
      });
    }
  }, {
    key: 'initCrosshair',
    value: function initCrosshair() {
      var crosshair = this.chartGroup.append('g').style('display', 'none');
      crosshair.append('line').attr('class', 'crossline').attr('id', 'crossLineX');

      crosshair.append('line').attr('class', 'crossline').attr('id', 'crossLineY');

      crosshair.append('circle').attr('class', 'circle').attr('r', 5).attr('id', 'crossCenter');

      this.crosshair = crosshair;
    }
  }, {
    key: 'renderLeftAxis',
    value: function renderLeftAxis() {
      var leftAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('id', 'leftAxis');

      var leftAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(5).tickPadding(4);

      leftAxisGroup.call(leftAxis);

      leftAxisGroup.selectAll('text').attr('transform', function (d, i) {
        if (i === 4) {
          return 'translate(' + 0 + ', ' + 5 + ')';
        } else {
          return '';
        }
      });

      this.leftAxis = leftAxis;

      // const rightAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('transform', `translate(${this.chartWidth}, 0)`);
      // const rightAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(this.chartWidth).tickFormat('');
      // rightAxisGroup.call(rightAxis);
    }
  }, {
    key: 'renderBottomAxis',
    value: function renderBottomAxis() {
      var bottomAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('id', 'bottomAxis');

      var bottomAxis = d3.axisBottom(this.scaleX).tickSize(5).tickPadding(4);

      this.bottomAxisGroup = bottomAxisGroup;
      this.bottomAxis = bottomAxis;

      bottomAxis.ticks(5);

      bottomAxisGroup.call(bottomAxis.tickFormat(d3.timeFormat("%H:%M"))).attr('transform', 'translate(0, ' + this.chartHeight + ')');
    }
  }, {
    key: 'initScale',
    value: function initScale() {
      var domainX = d3.extent(this.data, function (d) {
        return d.date;
      });
      // let domainY = d3.extent(this.data, d => d.urRatio);
      var domainY = [-1, 2];
      var scaleX = d3.scaleTime().domain(domainX).range([0, this.chartWidth]);
      var scaleY = d3.scaleLinear().domain(domainY).range([this.chartHeight, 0]);

      var domainYFix = linspace(domainY[0], domainY[1], 5).map(function (o) {
        return o.toFixed(2);
      });
      var rangeFix = linspace(this.chartHeight, 0, 5);
      var fixLengthScaleY = d3.scaleOrdinal().domain(domainYFix).range(rangeFix);

      this.domainX = domainX;
      this.domainY = domainY;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.domainYFix = domainYFix;
      this.fixLengthScaleY = fixLengthScaleY;
    }
  }, {
    key: 'renderChart',
    value: function renderChart() {
      var lineChartGroup = this.chartGroup.append('g');
      var scaleX = this.scaleX,
          scaleY = this.scaleY;

      var lineFn = d3.line().x(function (d) {
        return scaleX(d.date);
      }).y(function (d) {
        return scaleY(d.urRatio);
      });

      lineChartGroup.append('path').attr('class', 'ratio-line').datum(this.data).attr('d', lineFn).attr('fill', 'none').attr('stroke', this.options.lineColor);

      lineChartGroup.attr('transform', 'translate(1, 0)');
    }
  }, {
    key: 'addData',
    value: function addData(data) {
      this.data = [].concat(_toConsumableArray(this.data), _toConsumableArray(data));

      this.rescale();
      this.updateChart();
    }
  }, {
    key: 'updateData',
    value: function updateData(data) {
      this.data = data;
      this.rescale();
      this.updateChart();
    }
  }, {
    key: 'rescale',
    value: function rescale() {
      var domainX = d3.extent(this.data, function (d) {
        return d.date;
      });
      this.scaleX.domain(domainX);

      this.bottomAxisGroup.call(this.bottomAxis.tickFormat(d3.timeFormat("%H:%M")));
    }
  }, {
    key: 'updateChart',
    value: function updateChart() {
      var scaleX = this.scaleX;
      var scaleY = this.scaleY;

      var lineFn = d3.line().x(function (d) {
        return scaleX(d.date);
      }).y(function (d) {
        return scaleY(d.urRatio);
      });

      this.chartGroup.select('.ratio-line').datum(this.data).attr('d', lineFn);
    }
  }]);

  return LineChart;
}();

LineChart.defaultOptions = {
  containerWidth: 500,
  containerHeight: 300,
  lineColor: '#6db5f1',
  leftMargin: 20,
  bottomMargin: 20,
  margin: {
    left: 30,
    bottom: 20,
    right: 10,
    top: 5
  }
};


function linspace(a, b, n) {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,
      ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}

module.exports = LineChart;

/***/ })
/******/ ]);