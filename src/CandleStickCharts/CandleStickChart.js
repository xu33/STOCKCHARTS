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

  _initZoom() {
    let { width, height } = this.options;
    // 最少展示几根K线
    let minStickLength = 30;
    // 缩放比例 (当前放大了多少倍)
    let maxScale = this.options.data.length / minStickLength;
    // 索引-宽度 比例尺
    let indexScale = this.getIndexScale();

    this.indexScale = indexScale;

    // zoom事件会清除元素上的其他鼠标事件，所以不能绑定在已经绑定了其他鼠标事件的元素上，这里绑定在svg根元素上
    const zoomer = this.element;

    // zoom 事件监听函数
    const zoomed = () => {
      // 获取当前缩放系数
      let transform = d3.event.transform;
      // 根据当前缩放系数换算 缩放后比例尺的值域
      let currentScale = transform.rescaleX(indexScale);
      let domain = currentScale.domain();

      // 当前索引范围
      let extent = domain.map(Math.round);

      let [startIndexSelected, endIndexSelected] = this.bound(...extent);

      let selectedData = this.options.data.slice(
        startIndexSelected,
        endIndexSelected
      );

      this.startIndexSelected = startIndexSelected;
      this.endIndexSelected = endIndexSelected;
      this.render(selectedData);
    };

    // 初始化d3缩放行为
    let zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, 0]])
      .scaleExtent([1, maxScale])
      .on('zoom', zoomed);

    this.zoom = zoom;

    // 初始缩放矩阵对象(k, x, y)
    // 从最右侧开始展示，此处x和y也会根据k进行缩放
    let initTransform = d3.zoomIdentity.scale(maxScale).translate(-width, 0);
    console.log(initTransform);
    // 绑定缩放行为，并传入初始的缩放矩阵对象
    zoomer.call(zoom).call(zoom.transform, initTransform);
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
    let endIndex = this.endIndex ? this.endIndex : length - 1;
    let startIndex = this.startIndex ? this.startIndex : endIndex - minInterval;

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
      .on('zoom', zoomed);

    // 初始缩放
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
    console.log('resetZoomBehavior fired', k);
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
