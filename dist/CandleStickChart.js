var CandleStickChart =
webpackJsonp_name_([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  WIN_COLOR: '#ff3d3d',
  LOSS_COLOR: '#0fc351',
  EQUAL_COLOR: '#999999'
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.linspace = linspace;
function linspace(a, b, n) {
  if (typeof n === 'undefined') n = Math.max(Math.round(b - a) + 1, 1);
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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(5);

var _d2 = __webpack_require__(0);

var d3 = _interopRequireWildcard(_d2);

var _CandleSticks = __webpack_require__(9);

var _CandleSticks2 = _interopRequireDefault(_CandleSticks);

var _Volumes = __webpack_require__(13);

var _Volumes2 = _interopRequireDefault(_Volumes);

var _Dragbar = __webpack_require__(14);

var _Dragbar2 = _interopRequireDefault(_Dragbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CandleStickChart = function () {
  // 每个子图形占比
  function CandleStickChart(selector, _ref) {
    var _this = this;

    var width = _ref.width,
        height = _ref.height,
        type = _ref.type,
        data = _ref.data;

    _classCallCheck(this, CandleStickChart);

    this.handleBrush = function (_ref2) {
      var brushSelection = _ref2.brushSelection,
          range = _ref2.range;

      var startIndex = 0;
      var endIndex = _this.options.data.length - 1;
      var indexScale = d3.scaleLinear().domain([startIndex, endIndex]).range(range);

      var domain = brushSelection.map(function (value) {
        return indexScale.invert(value);
      });

      var _domain = _slicedToArray(domain, 2),
          selectedStartIndex = _domain[0],
          selectedEndIndex = _domain[1];

      if (selectedStartIndex < startIndex || selectedEndIndex > endIndex) {
        throw new Error('索引错误');
      }

      selectedStartIndex = Math.round(selectedStartIndex);
      selectedEndIndex = Math.round(selectedEndIndex);

      console.log('\u5F53\u524D\u6570\u636E\u8303\u56F4:' + selectedStartIndex + ' - ' + selectedEndIndex);

      // 至少显示30根K线
      if (selectedEndIndex - selectedStartIndex < 30) {
        return;
      }

      var selectedData = _this.options.data.slice(selectedStartIndex, selectedEndIndex);

      _this.currentBrushSelection = brushSelection;
      _this.currentRange = range;
      _this.selectedData = selectedData;
      _this.render();
    };

    this.element = d3.select(selector).append('svg');
    this.options = {
      width: width,
      height: height,
      type: type,
      data: data
    };

    this.element.attr('width', width).attr('height', height);
    this.selectedData = [];
    this.children = [];
    this.initChildren();
    this.bindEvents();
  }

  _createClass(CandleStickChart, [{
    key: 'initChildren',
    value: function initChildren() {
      var totalHeight = this.options.height;
      var totalWidth = this.options.width;
      var types = [_CandleSticks2.default, _Volumes2.default, _Dragbar2.default];

      // 前一个图形的高度
      var lastHeight = 0;

      for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var height = CandleStickChart.DIV[i] * totalHeight;
        var width = totalWidth;
        var x = 0;
        // 下一个图形的y坐标等于上面图形高度的和，外边距由每个图形自己处理
        var y = lastHeight;

        lastHeight += height;

        var chart = new type(this.element, {
          x: x,
          y: y,
          width: width,
          height: height,
          type: this.options.type
        });

        this.children.push(chart);
      }
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      // change brush selection need to rerender all charts
      var brush = this.children[this.children.length - 1];

      brush.on('brush', this.handleBrush);

      brush.initBrushBehavior();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.children.forEach(function (child) {
        return child.render(_this2.selectedData);
      });
    }
  }, {
    key: 'update',
    value: function update(items) {
      var _this3 = this;

      if (!Array.isArray(items)) {
        items = [items];
      }

      items.forEach(function (item) {
        return _this3.options.data.push(item);
      });

      setTimeout(function () {
        _this3.handleBrush({
          brushSelection: _this3.currentBrushSelection,
          range: _this3.currentRange
        });
      }, 17);
    }
  }, {
    key: 'rerender',
    value: function rerender(newData) {
      this.options.data = newData;
      this.children.forEach(function (child) {
        return child.element.remove();
      });
      this.children = [];
      this.selectedData = [];
      this.initChildren();
      this.bindEvents();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.children.forEach(function (child) {
        return child.element.remove();
      });
      this.element.remove();
    }
  }]);

  return CandleStickChart;
}();

CandleStickChart.DIV = [0.7, 0.2, 0.1];
exports.default = CandleStickChart;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(8)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!./candle_stick_chart.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!./candle_stick_chart.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(7)();
// imports


// module
exports.push([module.i, "*{margin:0;padding:0}body{-webkit-user-select:none}svg{display:block}.max_path,.min_path,.text_box,svg line,svg rect{shape-rendering:crispEdges}.axis text{fill:#888;font-size:12px}.axis path{stroke:#ccc;opacity:.2}.shadow{stroke-width:1px;fill:none}.tick line{stroke:#ccc;opacity:1}.predict{fill:#e7f2fc;fill-opacity:.6}.ceil,.flor,.profit{shape-rendering:auto}.ceil,.flor{stroke:#80b5ff;fill:none}.profit{stroke:#e63232;fill:none}.volume{stroke:#ccc;fill:none}.none{display:none}.poly path{shape-rendering:auto}.help{stroke:#999}.brush-bar{fill:none;stroke:#ccc}.selection{fill:#2f84cc;opacity:.4;stroke:#000}.ma5,.ma10,.ma20,.ma30{fill:none}.ma5{stroke:#cd4343}.ma10{stroke:#8c3037}.ma20{stroke:#ffca53}.ma30{stroke:#0055a2}.macd{shape-rendering:crispEdges}.dea{stroke:#014375;fill:none}.dif{stroke:#d20;fill:none}.up{fill:#ff3d3d}.down{fill:#0fc351}.eq{fill:#999}.axis_border{fill:none;stroke:#ccc}.event-overlay{fill:none;pointer-events:all}.crossline{stroke:#fff;opacity:.3}.indicator-text{fill:#fff;font-size:12px}.indicator-box{fill:#525a68}.volume-bg{fill:none;stroke:#ccc;opacity:.2}.overlay{stroke:#ccc;stroke-width:1}.selection{stroke-width:0}.handle--e,.handle--w{fill:#ccc}", ""]);

// exports


/***/ }),
/* 7 */
/***/ (function(module, exports) {

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


/***/ }),
/* 8 */
/***/ (function(module, exports) {

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
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = __webpack_require__(0);

var d3 = _interopRequireWildcard(_d);

var _colors = __webpack_require__(1);

var _colors2 = _interopRequireDefault(_colors);

var _Crosshair = __webpack_require__(10);

var _Crosshair2 = _interopRequireDefault(_Crosshair);

var _Indicator = __webpack_require__(11);

var _Indicator2 = _interopRequireDefault(_Indicator);

var _linspace = __webpack_require__(3);

var _chunkarray = __webpack_require__(12);

var _chunkarray2 = _interopRequireDefault(_chunkarray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CandleSticks = function () {
  function CandleSticks(parentNode, _ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height,
        type = _ref.type;

    _classCallCheck(this, CandleSticks);

    var _CandleSticks$margin = CandleSticks.margin,
        left = _CandleSticks$margin.left,
        right = _CandleSticks$margin.right,
        top = _CandleSticks$margin.top,
        bottom = _CandleSticks$margin.bottom;


    this.options = {
      x: x,
      y: y,
      width: width - left - right,
      height: height - top - bottom,
      type: type
    };

    var translateX = x + left;
    var translateY = y + top;

    this.element = parentNode.append('g');
    this.element.attr('transform', 'translate(' + translateX + ', ' + translateY + ')');

    this.init();
  }

  _createClass(CandleSticks, [{
    key: 'init',
    value: function init() {
      this.initGroups(); // 图形组
      this.initAxis(); // 数轴组
      this.initScales(); // 比例尺
      this.initCrosshair(); // 辅助线
      this.initIndicators(); // 指示器
      // this.initText(); // 顶部文字
    }

    // 顶部文字

  }, {
    key: 'initText',
    value: function initText() {
      var _CandleSticks$margin2 = CandleSticks.margin,
          top = _CandleSticks$margin2.top,
          left = _CandleSticks$margin2.left,
          right = _CandleSticks$margin2.right,
          bottom = _CandleSticks$margin2.bottom;
      var _options = this.options,
          width = _options.width,
          height = _options.height;


      var line = d3.line().x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      });

      var data = [{
        x: 0,
        y: top
      }, {
        x: 0,
        y: 1
      }, {
        x: width,
        y: 1
      }, {
        x: width,
        y: top
      }];

      this.element.append('text').attr('class', 'tip_text').attr('x', 8).attr('y', 15);

      this.element.append('path').datum(data).attr('d', line).attr('class', 'text_box').attr('fill', 'none').attr('stroke', '#ccc');
    }
  }, {
    key: 'extent',
    value: function extent() {
      var data = this.data;
      // 如果画均线 需要把均线的价格计算在内
      // let min = d3.min(data, d =>
      //   Math.min(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
      // );
      // let max = d3.max(data, d =>
      //   Math.max(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
      // );

      var min = d3.min(data, function (d) {
        return d.low;
      });
      var max = d3.max(data, function (d) {
        return d.high;
      });

      max = max * (1 + CandleSticks.offset_ratio);
      min = min - max * CandleSticks.offset_ratio;

      if (min < 0) min = 0;

      // return [
      //   min * (1 - CandleSticks.offset_ratio),
      //   max * (1 + CandleSticks.offset_ratio)
      // ];

      return [min, max];
    }

    // 初始化文字指示器

  }, {
    key: 'initIndicators',
    value: function initIndicators() {
      // 价格指示器
      this.priceIndicator = new _Indicator2.default(this.crosshair);
      // 时间指示器
      this.timeIndicator = new _Indicator2.default(this.crosshair);
    }
  }, {
    key: 'initCrosshair',
    value: function initCrosshair() {
      var _this = this;

      var _options2 = this.options,
          width = _options2.width,
          height = _options2.height;

      this.crosshair = new _Crosshair2.default(this.element, {
        x: 0,
        y: 0,
        width: width,
        height: height
      });

      this.crosshair.on('move', function (mousePosition) {
        var data = _this.data;
        var l = data.length;
        var scale_x = _this.scale_band;
        var scale_y = _this.scale_price;
        var mouse_x = mousePosition[0];
        var each_band_width = scale_x.step();
        var index = Math.round(mouse_x / each_band_width);
        if (index < 0) index = 0;
        if (index > l - 1) index = l - 1;
        var item = data[index];

        var x = scale_x(index) + scale_x.bandwidth() / 2;
        var y = scale_y(item.close);

        // 更新十字线坐标
        _this.crosshair.setHorizontalCrosslinePosition(y);
        _this.crosshair.setVerticalCrosslinePosition(x);

        // 更新指示器内容和位置
        _this.updateTimeIndicator(x, item);
        _this.updatePriceIndicator(y, item);
      });
    }

    // 渲染时间指示器

  }, {
    key: 'updateTimeIndicator',
    value: function updateTimeIndicator(x, currentDataItem) {
      var y = this.options.height;

      this.timeIndicator.setText(d3.timeFormat('%Y-%m-%d')(new Date(currentDataItem.timestamp)));

      this.timeIndicator.setPosition(x, y, 'vertical');
    }

    // 渲染价格指示器

  }, {
    key: 'updatePriceIndicator',
    value: function updatePriceIndicator(y, currentDataItem) {
      var x = 0;
      var price = d3.format('.2f')(currentDataItem.close);

      this.priceIndicator.setText(price);
      this.priceIndicator.setPosition(x, y, 'horizontal');
    }
  }, {
    key: 'initGroups',
    value: function initGroups() {
      // 蜡烛图组
      this.element.append('g').attr('class', 'candle_sticks');
      // 最高，最低组
      this.element.append('g').attr('class', 'min_and_max');
    }
  }, {
    key: 'initScales',
    value: function initScales() {
      var _CandleSticks$margin3 = CandleSticks.margin,
          left = _CandleSticks$margin3.left,
          right = _CandleSticks$margin3.right,
          bottom = _CandleSticks$margin3.bottom,
          top = _CandleSticks$margin3.top;
      var _options3 = this.options,
          width = _options3.width,
          height = _options3.height;

      // 公用的横轴range

      var range_x = this.range_x = [0, width];
      // 蜡烛图比例尺
      this.scale_band = d3.scaleBand().range(range_x).padding(0.2);

      var range_y = [height, 0];
      // 纵向价格比例尺
      this.scale_price = d3.scaleLinear().range(range_y);
    }
  }, {
    key: 'initAxis',
    value: function initAxis() {
      var _options4 = this.options,
          width = _options4.width,
          height = _options4.height;
      // 左y轴

      this.element.append('g').attr('class', 'axis left_axis');

      // 右y轴
      this.element.append('g').attr('class', 'axis right_axis').attr('transform', 'translate(' + width + ', ' + 0 + ')');

      // 底x轴
      this.element.append('g').attr('class', 'axis bottom_axis').attr('transform', 'translate(0, ' + height + ')');

      // 水平辅助线
      this.element.append('g').attr('class', 'axis grid_x');

      // 垂直辅助线
      this.element.append('g').attr('class', 'axis grid_y').attr('transform', 'translate(0, ' + height + ')');

      // 边框
      // this.element
      //   .append('rect')
      //   .attr('class', 'axis_border')
      //   .attr('x', 0)
      //   .attr('y', 1)
      //   .attr('width', width)
      //   .attr('height', height);
    }
  }, {
    key: 'render',
    value: function render(data) {
      this.data = data;
      if (!this.data || this.data.length < 1) return;
      this.renderCandleSticks();
      this.renderWicks();
      this.renderAxis();
    }
  }, {
    key: 'renderCandleSticks',
    value: function renderCandleSticks() {
      var scale_band = this.scale_band,
          scale_price = this.scale_price;

      var group = this.element.select('.candle_sticks');
      var data = this.data;

      var domain_price = this.extent();
      var domain_x = data.map(function (o, i) {
        return i;
      });

      scale_band.domain(domain_x);
      scale_price.domain(domain_price);

      var selection = group.selectAll('.bar').data(data, function (d) {
        return d.timestamp;
      });

      selection.exit().remove();

      selection.enter().append('rect').merge(selection).attr('class', 'bar').attr('x', function (d, i) {
        return scale_band(i);
      }).attr('y', function (_ref2) {
        var open = _ref2.open,
            close = _ref2.close;
        return scale_price(Math.max(open, close));
      }).attr('width', scale_band.bandwidth()).attr('height', function (_ref3) {
        var open = _ref3.open,
            close = _ref3.close;
        return Math.round(Math.abs(scale_price(open) - scale_price(close)));
      }).attr('fill', calColor);
    }
  }, {
    key: 'renderWicks',
    value: function renderWicks() {
      var group = this.element.select('.candle_sticks');
      var scale_band = this.scale_band,
          scale_price = this.scale_price,
          data = this.data;

      var line = d3.line().x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      });

      var maxPrice = data[0].high;
      var minPrice = data[0].low;
      var maxOneX = void 0;
      var maxOneY = void 0;
      var minOneX = void 0;
      var minOneY = void 0;

      var wicks = group.selectAll('.shadow').data(data);

      wicks.exit().remove();

      wicks.enter().append('path').merge(wicks).attr('class', 'shadow').attr('d', function (d, i) {
        var x = scale_band(i) + scale_band.bandwidth() / 2;
        var y1 = scale_price(d.high);
        var y2 = scale_price(d.low);

        if (d.high >= maxPrice) {
          maxPrice = d.high;
          maxOneX = x;
          maxOneY = y1;
        }

        if (d.low <= minPrice) {
          minPrice = d.low;
          minOneX = x;
          minOneY = y2;
        }

        // console.log('high:', d.high);

        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
      }).attr('stroke', calColor);

      this.renderMaxAndMin(maxOneX, maxOneY, minOneX, minOneY, maxPrice, minPrice);

      // console.log(scale_price.domain());

      // console.log(maxOneX, maxOneY, minOneX, minOneY);
    }
  }, {
    key: 'calculateLeftAndRightAxisScale',
    value: function calculateLeftAndRightAxisScale() {
      var lengthNeed = 4;
      var _CandleSticks$margin4 = CandleSticks.margin,
          left = _CandleSticks$margin4.left,
          right = _CandleSticks$margin4.right,
          bottom = _CandleSticks$margin4.bottom,
          top = _CandleSticks$margin4.top;
      var _options5 = this.options,
          width = _options5.width,
          height = _options5.height;

      var domain = this.extent();

      domain = (0, _linspace.linspace)(domain[1], domain[0], lengthNeed);
      var range = (0, _linspace.linspace)(0, height, lengthNeed);

      var scale = d3.scaleOrdinal().domain(domain).range(range);

      this.leftAndRightAxisScale = scale;
    }
  }, {
    key: 'renderAxis',
    value: function renderAxis() {
      // 计算左右两个轴的序数比例尺
      this.calculateLeftAndRightAxisScale();
      // 渲染左侧数轴
      this.renderLeftAxis();
      // 渲染右侧数轴
      this.renderRightAxis();
      // 渲染底部数轴
      this.renderBottomAxis();
    }
  }, {
    key: 'renderLeftAxis',
    value: function renderLeftAxis() {
      var formatter = d3.format('.2f');

      if (this.leftAxis === undefined) {
        this.leftAxis = d3.axisRight(this.leftAndRightAxisScale.copy()).tickSize(0).tickPadding(5).tickFormat(formatter);
      }

      this.leftAxis.scale(this.leftAndRightAxisScale.copy());

      this.element.select('.left_axis').call(this.leftAxis);

      this.element.select('.left_axis').selectAll('.tick text').attr('transform', function (d, i) {
        if (i === 0) {
          return 'translate(0, 10)';
        } else {
          return 'translate(0, -10)';
        }
      });

      this.renderHorizontalGridLines();
    }
  }, {
    key: 'renderHorizontalGridLines',
    value: function renderHorizontalGridLines() {
      var axis = d3.axisLeft(this.leftAndRightAxisScale.copy()).tickSize(-this.options.width).tickFormat('');

      this.element.select('.grid_x').call(axis);
    }
  }, {
    key: 'renderRightAxis',
    value: function renderRightAxis() {
      // console.log('renderRightAxis fired');
      var formatter = d3.format('.2f');

      if (this.rightAxis === undefined) {
        this.rightAxis = d3.axisLeft(this.leftAndRightAxisScale.copy()).tickSize(0).tickPadding(5).tickFormat(formatter);
      }

      this.rightAxis.scale(this.leftAndRightAxisScale.copy());
      this.element.select('.right_axis').call(this.rightAxis);

      this.element.select('.right_axis').selectAll('.tick text').attr('transform', function (d, i) {
        if (i === 0) {
          return 'translate(0, 10)';
        } else {
          return 'translate(0, -10)';
        }
      });
    }
  }, {
    key: 'getBottomAxisTickFormatter',
    value: function getBottomAxisTickFormatter() {
      var type = this.options.type;
      switch (type) {
        case '1':
        case '5':
          return d3.timeFormat('%M:%S');
        case '15':
        case '30':
        case '60':
          return d3.timeFormat('%m-%d');
        case 'D':
        case 'W':
        case 'M':
        case 'Y':
          return d3.timeFormat('%Y-%m-%d');
        default:
          return d3.timeFormat('%Y-%m-%d');
      }
    }
  }, {
    key: 'renderBottomAxis',
    value: function renderBottomAxis() {
      var _CandleSticks$margin5 = CandleSticks.margin,
          left = _CandleSticks$margin5.left,
          right = _CandleSticks$margin5.right,
          bottom = _CandleSticks$margin5.bottom,
          top = _CandleSticks$margin5.top;
      var _options6 = this.options,
          width = _options6.width,
          height = _options6.height;

      var lengthNeed = 4;
      var chunks = (0, _chunkarray2.default)([].concat(_toConsumableArray(this.data)), lengthNeed);
      var domain = chunks.map(function (chunk) {
        return new Date(chunk[0].timestamp);
      });
      var range = (0, _linspace.linspace)(0, width, lengthNeed + 1);

      if (domain.length > lengthNeed) domain.pop();

      domain.push(new Date());

      // console.log(domain, range);

      var scale = d3.scaleOrdinal().domain(domain).range(range);

      var formatter = this.getBottomAxisTickFormatter();

      var bottomAxis = d3.axisBottom(scale).tickSize(0).tickPadding(8).tickFormat(formatter);

      var element = this.element.select('.bottom_axis');

      element.call(bottomAxis);
      element.selectAll('.tick text').attr('text-anchor', 'start').style('display', function (d, i) {
        if (i === range.length - 1) return 'none';else return null;
      });

      this.renderVerticalGridLines(scale);
    }
  }, {
    key: 'renderVerticalGridLines',
    value: function renderVerticalGridLines(scale) {
      var axis = d3.axisBottom(scale).tickSize(-this.options.height).tickFormat('');

      this.element.select('.grid_y').call(axis);
    }
  }, {
    key: 'renderMaxAndMin',
    value: function renderMaxAndMin(maxOneX, maxOneY, minOneX, minOneY, maxPrice, minPrice) {
      var width = this.options.width;

      var group = this.element.select('.min_and_max');
      var line = d3.line().x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      });

      if (group.select('.min_path').empty()) {
        group.append('path').attr('class', 'min_path');
        group.append('rect').attr('class', 'min_wrap indicator-box');
        group.append('text').attr('class', 'min_price').style('font-size', '10px');
      }

      if (group.select('.max_path').empty()) {
        group.append('path').attr('class', 'max_path');
        group.append('rect').attr('class', 'max_wrap indicator-box');
        group.append('text').attr('class', 'max_price').style('font-size', '10px');
      }

      var maxOneX2, minOneX2;
      var maxTextX, minTextX;

      if (maxOneX > 0 && maxOneX < width - 50) {
        maxOneX2 = maxOneX + 10;
        maxTextX = maxOneX2;
      } else {
        maxOneX2 = maxOneX - 10;
        maxTextX = maxOneX2 - 20;
      }

      if (minOneX > 0 && minOneX < width - 50) {
        minOneX2 = minOneX + 10;
        minTextX = minOneX2;
      } else {
        minOneX2 = minOneX - 10;
        minTextX = minOneX2 - 20;
      }

      group.select('.max_path').attr('d', function () {
        return line([{
          x: maxOneX,
          y: maxOneY
        }, {
          x: maxOneX2,
          y: maxOneY
        }]);
      }).attr('stroke', '#000');

      group.select('.min_path').attr('d', function () {
        return line([{
          x: minOneX,
          y: minOneY
        }, {
          x: minOneX2,
          y: minOneY
        }]);
      }).attr('stroke', '#000');

      // console.log(maxPrice, minPrice);

      this.renderMaxText(group, maxTextX, maxOneY, maxPrice);
      this.renderMinText(group, minTextX, minOneY + 10, minPrice);
    }
  }, {
    key: 'renderMinText',
    value: function renderMinText(group, x, y, text) {
      var element = group.select('.min_price');

      element.attr('x', x).attr('y', y).text(d3.format('.2f')(text));

      var boundingBox = element.node().getBBox();
      var attrs = ['width', 'height', 'x', 'y'];
      var rect = group.select('.min_wrap');
      // attrs.forEach(attr => {
      //   rect.attr(attr, boundingBox[attr]);
      // });
      rect.attr('x', boundingBox.x - 2).attr('y', boundingBox.y).attr('width', boundingBox.width + 4).attr('height', boundingBox.height);
    }
  }, {
    key: 'renderMaxText',
    value: function renderMaxText(group, x, y, text) {
      var element = group.select('.max_price');

      element.attr('x', x).attr('y', y).text(d3.format('.2f')(text));

      var boundingBox = element.node().getBBox();
      // let attrs = ['width', 'height', 'x', 'y'];
      var rect = group.select('.max_wrap');
      // attrs.forEach(attr => {
      //   rect.attr(attr, boundingBox[attr]);
      // });

      rect.attr('x', boundingBox.x - 2).attr('y', boundingBox.y).attr('width', boundingBox.width + 4).attr('height', boundingBox.height);
    }
  }]);

  return CandleSticks;
}();

CandleSticks.margin = {
  left: 10,
  right: 3,
  top: 20,
  bottom: 20
};
CandleSticks.x_tick_num = 3;
CandleSticks.y_tick_num = 3;
CandleSticks.offset_ratio = 0.2;


function calColor(d) {
  if (d.close > d.open) {
    return _colors2.default.WIN_COLOR;
  } else if (d.close < d.open) {
    return _colors2.default.LOSS_COLOR;
  } else {
    return _colors2.default.EQUAL_COLOR;
  }
}

exports.default = CandleSticks;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = __webpack_require__(0);

var d3 = _interopRequireWildcard(_d);

var _events = __webpack_require__(2);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Crosshair = function (_EventEmitter) {
  _inherits(Crosshair, _EventEmitter);

  function Crosshair(parentNode, bound) {
    _classCallCheck(this, Crosshair);

    var _this = _possibleConstructorReturn(this, (Crosshair.__proto__ || Object.getPrototypeOf(Crosshair)).call(this));

    _this.parentNode = parentNode;
    _this.bound = bound;

    var _this$bound = _this.bound,
        x = _this$bound.x,
        y = _this$bound.y;

    _this.element = _this.parentNode.append('g').attr('transform', 'translate(' + x + ', ' + y + ')').style('display', 'none');

    _this.crossLineX = _this.element.append('line').attr('class', 'crossline');

    _this.crossLineY = _this.element.append('line').attr('class', 'crossline');

    _this.createEventLayer();
    return _this;
  }

  _createClass(Crosshair, [{
    key: 'createEventLayer',
    value: function createEventLayer() {
      var _bound = this.bound,
          width = _bound.width,
          height = _bound.height,
          x = _bound.x,
          y = _bound.y;
      var element = this.element,
          crossLineX = this.crossLineX,
          crossLineY = this.crossLineY;

      var self = this;

      this.layer = this.parentNode.append('rect').attr('width', width).attr('height', height).attr('class', 'event_layer').attr('transform', 'translate(' + x + ', ' + y + ')').on('mouseover', function () {
        element.style('display', null);
      }).on('mousemove', function () {
        var mousePosition = d3.mouse(this);

        crossLineX.attr('x1', 0).attr('x2', width);
        crossLineY.attr('y1', 0).attr('y2', height);

        self.emit('move', mousePosition);
      }).on('mouseout', function () {
        element.style('display', 'none');
        self.emit('end');
      });
    }
  }, {
    key: 'setHorizontalCrosslinePosition',
    value: function setHorizontalCrosslinePosition(y) {
      // 横向指示线的两点x坐标固定是左端和右端，所以只需要动态设置y坐标即可
      this.crossLineX.attr('y1', y).attr('y2', y);
    }
  }, {
    key: 'setVerticalCrosslinePosition',
    value: function setVerticalCrosslinePosition(x) {
      // 竖向指示线的两点y坐标固定是顶端和低端，所以只需要动态设置x坐标即可
      this.crossLineY.attr('x1', x).attr('x2', x);
    }
  }]);

  return Crosshair;
}(_events2.default);

exports.default = Crosshair;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 十字线提示标签类
 * 
 * @class Indicator
 */
var Indicator = function () {
  function Indicator(parent, width, height) {
    _classCallCheck(this, Indicator);

    this.parent = parent;
    this.element = parent.element.append('g');
    this.createRect();
    this.createText();
  }

  _createClass(Indicator, [{
    key: 'show',
    value: function show() {
      this.element.style('display', null);
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.element.style('display', 'none');
    }
  }, {
    key: 'createText',
    value: function createText() {
      this.text = this.element.append('text').attr('alignment-baseline', 'hanging').attr('text-anchor', 'start').attr('class', Indicator.INDICATOR_CLASS);
    }
  }, {
    key: 'createRect',
    value: function createRect() {
      this.box = this.element.append('rect').attr('class', Indicator.INDICATOR_BOX_CLASS);
    }
  }, {
    key: 'setText',
    value: function setText(text) {
      this.text.text(text);
    }
  }, {
    key: 'setPosition',
    value: function setPosition(x, y, type, direction) {
      var TEXT_PADDING = Indicator.TEXT_PADDING;
      var textBoundingBox = this.text.node().getBBox();
      var width = textBoundingBox.width,
          height = textBoundingBox.height;

      var boxWidth = width + TEXT_PADDING * 2; // padding left and right is 2
      var boxHeight = height;
      this.text.attr('dx', TEXT_PADDING);

      this.box.attr('width', boxWidth).attr('height', boxHeight).attr('x', textBoundingBox.x - TEXT_PADDING).attr('y', textBoundingBox.y);

      // let tx = (Indicator.WIDTH - width) / 2;
      // let tx = 0;
      // let ty = (this.height - height) / 2;

      // this.text.attr('x', tx).attr('y', ty);

      if (type === 'horizontal') {
        // 水平的指示器
        y = y - boxHeight / 2;
      } else {
        // 垂直的指示器
        x = x - boxWidth / 2;
        y = y + 3;
      }

      if (direction === 'right') {
        x = x - boxWidth;
      }

      if (x < 0) {
        x = 0;
      }

      if (x > this.parent.bound.width - boxWidth) {
        x = this.parent.bound.width - boxWidth;
      }

      this.element.attr('transform', 'translate(' + x + ', ' + y + ')');
    }
  }]);

  return Indicator;
}();

Indicator.INDICATOR_CLASS = 'indicator-text';
Indicator.INDICATOR_BOX_CLASS = 'indicator-box';
Indicator.TEXT_PADDING = 2;
exports.default = Indicator;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = chunkArray;
function chunkArray(array, eachLength) {
  var results = [];
  var length = array.length;
  var chunkSize = Math.round(length / eachLength);

  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }

  return results;
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = __webpack_require__(0);

var d3 = _interopRequireWildcard(_d);

var _colors = __webpack_require__(1);

var _colors2 = _interopRequireDefault(_colors);

var _linspace = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Volumes = function () {
  function Volumes(parentNode, _ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    _classCallCheck(this, Volumes);

    var _Volumes$margin = Volumes.margin,
        left = _Volumes$margin.left,
        right = _Volumes$margin.right,
        top = _Volumes$margin.top,
        bottom = _Volumes$margin.bottom;


    this.options = {
      x: x,
      y: y,
      width: width - left - right,
      height: height - top - bottom
    };

    var translateX = x + left;
    var translateY = y + top;
    this.element = parentNode.append('g');
    this.element.attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
    this.initScales();
  }

  _createClass(Volumes, [{
    key: 'initScales',
    value: function initScales() {
      var _Volumes$margin2 = Volumes.margin,
          left = _Volumes$margin2.left,
          right = _Volumes$margin2.right,
          top = _Volumes$margin2.top,
          bottom = _Volumes$margin2.bottom;
      var _options = this.options,
          width = _options.width,
          height = _options.height;

      var range_volume = [height, 0];
      this.scale_volume = d3.scaleLinear().range(range_volume);

      var range_x = [0, width];
      this.scale_band = d3.scaleBand().range(range_x).padding(0.2);

      // 边框&辅助线
      this.render_grids();
    }
  }, {
    key: 'render_grids',
    value: function render_grids() {
      this.render_grids_x();
      this.render_grids_y();
    }
  }, {
    key: 'render_grids_x',
    value: function render_grids_x() {
      var _options2 = this.options,
          width = _options2.width,
          height = _options2.height;

      var group = this.element.append('g').attr('class', 'axis').attr('transform', 'translate(0, ' + height + ')');
      var scale = d3.scaleOrdinal().range((0, _linspace.linspace)(0, width - 1, 3)).domain([1, 2, 3]);
      var axis = d3.axisBottom(scale).tickSize(-height).tickFormat('');

      group.call(axis);
    }
  }, {
    key: 'render_grids_y',
    value: function render_grids_y() {
      var _options3 = this.options,
          width = _options3.width,
          height = _options3.height;

      var group = this.element.append('g').attr('class', 'axis');

      var scale = d3.scaleOrdinal().range((0, _linspace.linspace)(0, height, 3)).domain([1, 2, 3]);

      var axis = d3.axisLeft(scale).tickSize(-width).tickFormat('');

      group.call(axis);
    }
  }, {
    key: 'render',
    value: function render(data) {
      var _options4 = this.options,
          width = _options4.width,
          height = _options4.height;
      var scale_band = this.scale_band,
          scale_volume = this.scale_volume;


      var domain_x = data.map(function (o, i) {
        return i;
      });

      scale_band.domain(domain_x);

      var domain_volume = d3.extent(data, function (d) {
        return d.volume;
      });
      scale_volume.domain(domain_volume);

      var selection = this.element.selectAll('.bar').data(data);
      selection.exit().remove();

      selection.enter().append('rect').merge(selection).attr('class', 'bar').attr('x', function (d, i) {
        return scale_band(i);
      }).attr('y', function (d) {
        return scale_volume(d.volume);
      }).attr('width', scale_band.bandwidth()).attr('height', function (d) {
        return height - scale_volume(d.volume);
      }).attr('fill', calColor);
    }
  }]);

  return Volumes;
}();

Volumes.margin = {
  left: 10,
  right: 3,
  top: 0,
  bottom: 10
};


function calColor(d) {
  if (d.close > d.open) {
    return _colors2.default.WIN_COLOR;
  } else if (d.close < d.open) {
    return _colors2.default.LOSS_COLOR;
  } else {
    return _colors2.default.EQUAL_COLOR;
  }
}

exports.default = Volumes;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = __webpack_require__(0);

var d3 = _interopRequireWildcard(_d);

var _events = __webpack_require__(2);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* bursh区域 */

var Dragbar = function (_EventEmitter) {
  _inherits(Dragbar, _EventEmitter);

  function Dragbar(parentNode, _ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    _classCallCheck(this, Dragbar);

    var _this = _possibleConstructorReturn(this, (Dragbar.__proto__ || Object.getPrototypeOf(Dragbar)).call(this));

    var _Dragbar$margin = Dragbar.margin,
        left = _Dragbar$margin.left,
        right = _Dragbar$margin.right,
        top = _Dragbar$margin.top,
        bottom = _Dragbar$margin.bottom;


    _this.options = {
      x: x,
      y: y,
      width: width - left - right,
      height: height - top - bottom
    };

    var translateX = x + left;
    var translateY = y + top;
    _this.element = parentNode.append('g');
    _this.element.attr('class', 'chart-brush').attr('transform', 'translate(' + translateX + ', ' + translateY + ')');

    // 初始的范围
    _this.initBrushSelection = [_this.options.width - 100, _this.options.width];

    // this.initBrushBehavior();
    return _this;
  }

  _createClass(Dragbar, [{
    key: 'initBrushBehavior',
    value: function initBrushBehavior() {
      var width = this.options.width;
      var height = this.options.height;
      var brush = d3.brushX();

      brush.extent([[0, 0], [width, height]]);
      brush.on('brush', this.handleBrush.bind(this));

      this.element.call(brush).call(brush.move, this.initBrushSelection);
    }
  }, {
    key: 'handleBrush',
    value: function handleBrush() {
      // if (!d3.event.sourceEvent) return;
      var brushSelection = d3.event.selection;

      this.currentBrushSelection = brushSelection;
      this.emit('brush', {
        brushSelection: this.currentBrushSelection,
        range: [0, this.options.width]
      });
    }
  }, {
    key: 'render',
    value: function render() {}
  }]);

  return Dragbar;
}(_events2.default);

Dragbar.margin = {
  left: 10,
  right: 3,
  top: 0,
  bottom: 3
};
exports.default = Dragbar;

/***/ })
],[4]);