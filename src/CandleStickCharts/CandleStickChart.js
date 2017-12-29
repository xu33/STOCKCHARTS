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

    this.currentTransform = null;
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
    var startIndex = 0;
    var endIndex = this.options.data.length - 1;
    var indexScale = d3
      .scaleLinear()
      .domain([startIndex, endIndex])
      .range([0, this.options.width]);

    return indexScale;
  }

  initZoom() {
    let { width, height } = this.options;
    // 最少展示几根K线
    let minStickLength = 30;
    // 缩放比例 (当前放大了多少倍)
    let scaleK = this.options.data.length / minStickLength;
    // 索引-宽度 比例尺
    let indexScale = this.getIndexScale();
    // 响应缩放事件的层
    // const zoomer = this.element
    //   .append('rect')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .style('fill', 'none')
    //   .style('pointer-events', 'all');

    const zoomer = this.element;

    // zoom 事件监听函数
    const zoomed = () => {
      // 获取当前缩放系数
      let transform = d3.event.transform;

      this.currentTransform = transform;

      console.log('currentTransform:', transform);
      // console.log('range before:', indexScale.range());

      // 根据当前缩放系数换算 缩放后比例尺的值域
      let currentScale = transform.rescaleX(indexScale);
      let domain = currentScale.domain();

      // console.log('range zoomed:', currentScale.range());

      // 当前索引范围
      let extent = domain.map(Math.round);

      let [startIndexSelected, endIndexSelected] = this.bound(...extent);

      let selectedData = this.options.data.slice(
        startIndexSelected,
        endIndexSelected
      );

      this.render(selectedData);
    };

    // 初始化d3缩放行为
    let zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, 0]])
      .scaleExtent([1, scaleK])
      .on('zoom', zoomed);

    if (!this.currentTransform) {
      // 初始缩放矩阵对象(k, x, y)
      // 从最右侧开始展示，此处x和y也会根据k进行缩放
      let initTransform = d3.zoomIdentity.scale(scaleK).translate(-width, 0);

      // console.log(initTransform);

      // 绑定缩放行为，并传入初始的缩放矩阵对象
      zoomer.call(zoom).call(zoom.transform, initTransform);
    } else {
      zoomer.call(zoom).call(zoom.transform, this.currentTransform);
    }
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

    this.options = Object.assign(this.options, {
      width,
      height
    });

    setAttrs(this.element, {
      width,
      height
    });

    this.resizeChidren(width, height);
    this.resetZoomBehavior();
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

  resetZoomBehavior() {
    console.log('resetZoomBehavior fired');
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
