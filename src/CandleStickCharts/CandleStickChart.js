import './candle_stick_chart.css';
import * as d3 from 'd3';
import CandleSticks from './CandleSticks';
import Volumes from './Volumes';

function setAttrs(el, attrs) {
  for (var key in attrs) {
    el = el.attr(key, attrs[key]);
  }

  return el;
}

const ChildTypes = [
  {
    type: CandleSticks,
    percent: 0.7
  },
  {
    type: Volumes,
    percent: 0.3
  }
];

const MIN_WIDTH = 400;
const MIN_HEIGHT = 200;

class CandleStickChart {
  constructor(selector, { width, height, type, data }) {
    this.element = d3.select(selector).append('svg');
    this.options = {
      width,
      height,
      type,
      data
    };

    setAttrs(this.element, {
      width: this.options.width,
      height: this.options.height
    });

    this.children = [];
    this.initChildren();
    this.initZoom();
  }

  initChildren() {
    var totalHeight = this.options.height;
    var totalWidth = this.options.width;
    var lastHeight = 0; // 前一个图形的高度

    ChildTypes.forEach((child, index) => {
      var type = child.type;
      var percent = child.percent;
      var height = percent * totalHeight;
      var x = 0;
      var y = lastHeight;
      var parent = this;

      this.children[index] = new type(this.element, {
        x,
        y,
        width: totalWidth,
        height,
        type,
        parent
      });

      lastHeight += height;
    });
  }

  getIndexScale() {
    return d3
      .scaleLinear()
      .domain([0, this.options.data.length - 1])
      .range([0, this.options.width]);
  }

  bound(start, end) {
    const startIndex = 0;
    const endIndex = this.options.data.length - 1;

    if (start >= startIndex && end <= endIndex) {
      start = start;
      end = end;
    } else if (start < startIndex && end <= endIndex) {
      end = end - start;
      start = 0;
    } else if (start >= startIndex && end > endIndex) {
      start = endIndex - (end - start);
      end = endIndex;
    } else {
      throw new Error('范围错误');
    }

    return [start, end];
  }

  render(selectedData) {
    this.children.forEach(child => child.render(selectedData));
  }

  resize(width, height) {
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return;
    }

    let k = width / this.options.width;

    this.options = Object.assign(this.options, {
      width,
      height
    });

    setAttrs(this.element, {
      width,
      height
    });

    this.resizeChidren(width, height);
    this.resetZoomBehavior(k);
  }

  resizeChidren(width, height) {
    var parentHeight = this.options.height;
    var width = this.options.width;
    var lastHeight = 0;

    ChildTypes.forEach((child, index) => {
      var { type, percent } = child;
      var height = parentHeight * percent;
      var x = 0;
      var y = lastHeight;

      if (
        this.children[index].resize &&
        typeof this.children[index].resize === 'function'
      ) {
        this.children[index].resize({
          x,
          y,
          width,
          height
        });
      }

      lastHeight += height;
    });
  }

  initZoom() {
    let width = this.options.width;
    let minInterval = 30;
    let length = this.options.data.length;
    let maxScale = length / minInterval;
    let indexScale = this.getIndexScale();
    let endIndex = this.endIndex !== undefined ? this.endIndex : length - 1;
    let startIndex =
      this.startIndex !== undefined ? this.startIndex : endIndex - minInterval;

    let zoomed = () => {
      let transform = d3.event.transform;
      // console.log('on zoom:', transform);
      let currentScale = transform.rescaleX(indexScale);
      let domain = currentScale.domain();
      let extent = domain.map(Math.round);
      let [startIndex, endIndex] = this.bound(...extent);
      let interval = this.options.data.slice(startIndex, endIndex);
      this.startIndex = startIndex;
      this.endIndex = endIndex;

      this.render(interval);
    };

    let zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, 0]])
      .scaleExtent([1, maxScale])
      .on('start', () => {
        this.children.forEach(childInst => {
          childInst.handleZoomStart && childInst.handleZoomStart();
        });
      })
      .on('end', childInst => {
        this.children.forEach(childInst => {
          childInst.handleZoomEnd && childInst.handleZoomEnd();
        });
      })
      .on('zoom', zoomed);

    /* 以下为拖动&缩放行为的核心代码 */

    // 初始缩放系数
    let k = width / (indexScale(endIndex) - indexScale(startIndex));
    if (k > maxScale) k = maxScale;
    if (k < 1) k = 1;
    // 初始位移
    let x = -indexScale(startIndex);
    // 初始transform
    let transform = d3.zoomIdentity.scale(k).translate(x, 0);
    // 绑定事件，并设置初始偏移量
    this.element.call(zoom).call(zoom.transform, transform);
  }

  // k缩放比例
  resetZoomBehavior(k) {
    this.element.on('.zoom', null);
    this.initZoom();
  }

  update(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    items.forEach(item => this.options.data.push(item));

    setTimeout(() => {
      this.handleBrush({
        brushSelection: this.currentBrushSelection,
        range: this.currentRange
      });
    }, 17);
  }

  rerender(newData) {
    this.options.data = newData;
    this.children.forEach(child => child.element.remove());
    this.children = [];
    this.initChildren();
    this.initZoom();
  }

  destroy() {
    this.children.forEach(child => child.element.remove());
    this.element.remove();
  }
}

export default CandleStickChart;
