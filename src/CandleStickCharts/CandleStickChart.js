import './candle_stick_chart.css';
import * as d3 from 'd3';
import CandleSticks from './CandleSticks';
import Volumes from './Volumes';
// import Brush from './Brush';

function setAttrs(el, attrs) {
  for (var key in attrs) {
    el.attr(key, attrs[key]);
  }

  return el;
}

class CandleStickChart {
  // 每个子图形占比
  // static DIV = [0.7, 0.2, 0.1];
  static DIV = [0.7, 0.3];

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
      height: this.element.height
    });

    this.children = [];
    this.initChildren();
  }

  initChildren() {
    let totalHeight = this.options.height;
    let totalWidth = this.options.width;
    // let types = [CandleSticks, Volumes, Brush];
    let types = [CandleSticks, Volumes];

    // 前一个图形的高度
    let lastHeight = 0;

    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let height = CandleStickChart.DIV[i] * totalHeight;
      let width = totalWidth;
      let x = 0;
      // 下一个图形的y坐标等于上面图形高度的和，外边距由每个图形自己处理
      let y = lastHeight;

      lastHeight += height;

      let chart = new type(this.element, {
        x,
        y,
        width,
        height,
        type: this.options.type,
        parent: this
      });

      this.children.push(chart);
    }

    this.initZoom();
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

  initZoomOnExistingNode(zoomer) {
    let width = zoomer.attr('width');
    let height = zoomer.attr('height');
    let minStickLength = 30;
    let percent = minStickLength / this.options.data.length;
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

      console.log(transform);
      console.log('range before:', indexScale.range());

      // 根据当前缩放系数换算 缩放后比例尺的值域
      let currentScale = transform.rescaleX(indexScale);
      let domain = currentScale.domain();

      console.log('range zoomed:', currentScale.range());

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

    // 初始缩放矩阵对象(k, x, y)
    // 从最右侧开始展示，此处x和y也会根据k进行缩放
    let initTransform = d3.zoomIdentity.scale(scaleK).translate(-width, 0);

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
    this.options = Object.assign(this.options, {
      width,
      height
    });

    setAttrs(this.element, {
      width,
      height
    });
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
