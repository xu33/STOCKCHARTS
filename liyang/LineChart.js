(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3"));
	else if(typeof define === 'function' && define.amd)
		define(["d3"], factory);
	else if(typeof exports === 'object')
		exports["LineChart"] = factory(require("d3"));
	else
		root["LineChart"] = factory(root["d3"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
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

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	__webpack_require__(1);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var d3 = __webpack_require__(5);

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

	      var leftAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(0).tickPadding(4);

	      leftAxisGroup.call(leftAxis);

	      leftAxisGroup.selectAll('text').attr('transform', function (d, i) {
	        if (i === 4) {
	          return 'translate(' + 0 + ', ' + 5 + ')';
	        } else {
	          return '';
	        }
	      });

	      this.leftAxis = leftAxis;

	      var rightAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('transform', 'translate(' + this.chartWidth + ', 0)');
	      var rightAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(this.chartWidth).tickFormat('');
	      rightAxisGroup.call(rightAxis);
	    }
	  }, {
	    key: 'renderBottomAxis',
	    value: function renderBottomAxis() {
	      var bottomAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('id', 'bottomAxis');

	      var bottomAxis = d3.axisBottom(this.scaleX).tickSize(0).tickPadding(4);

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
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./line.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./line.css");
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
	exports.push([module.id, ".tooltip {\r\n  position: absolute;\r\n  padding: 10px;\r\n  max-width: 200px;\r\n  border: 1px solid #ccc;\r\n  background: #fff;\r\n  pointer-events: none;\r\n  word-break: break-all;\r\n  word-wrap: break-word;\r\n}\r\n\r\n.overlay {\r\n    fill: none;\r\n    pointer-events: all;\r\n}\r\n\r\n/* 数轴颜色 */\r\n.chart-axis path {\r\n    stroke: #d4d4d4;\r\n}\r\n\r\n/* 数字文字颜色 */\r\n.chart-axis text {\r\n    fill: #999999;\r\n}\r\n\r\n.chart-axis line {\r\n    stroke: #d4d4d4;\r\n    shape-rendering:crispEdges;\r\n}\r\n\r\n.crossline {\r\n    fill: none;\r\n    stroke: #6db5f1;\r\n    stroke-width: 0.5px;\r\n}\r\n\r\n.circle {\r\n    fill: #6db5f1;\r\n    stroke: none;\r\n    opacity: 0.6;\r\n}", ""]);

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
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }
/******/ ])
});
;