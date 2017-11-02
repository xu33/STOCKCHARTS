import './candle_stick_chart.css';
import * as d3 from 'd3';
import CandleSticks from './CandleSticks';
import Volumes from './Volumes';
import Brush from './Brush';

class CandleStickChart {
  // 每个子图形占比
  // static DIV = [0.7, 0.2, 0.1];
  static DIV = [0.7, 0.3];

  // handleBrush = ({ brushSelection, range }) => {
  //   let startIndex = 0;
  //   let endIndex = this.options.data.length - 1;
  //   let indexScale = d3
  //     .scaleLinear()
  //     .domain([startIndex, endIndex])
  //     .range(range);

  //   let domain = brushSelection.map(value => indexScale.invert(value));
  //   let [selectedStartIndex, selectedEndIndex] = domain;
  //   if (selectedStartIndex < startIndex || selectedEndIndex > endIndex) {
  //     throw new Error('索引错误');
  //   }

  //   selectedStartIndex = Math.round(selectedStartIndex);
  //   selectedEndIndex = Math.round(selectedEndIndex);

  //   console.log(`当前数据范围:${selectedStartIndex} - ${selectedEndIndex}`);

  //   // 至少显示30根K线
  //   if (selectedEndIndex - selectedStartIndex < 30) {
  //     return;
  //   }

  //   let selectedData = this.options.data.slice(
  //     selectedStartIndex,
  //     selectedEndIndex
  //   );

  //   this.currentBrushSelection = brushSelection;
  //   this.currentRange = range;
  //   this.selectedData = selectedData;
  //   this.render();
  // };

  constructor(selector, { width, height, type, data }) {
    this.element = d3.select(selector).append('svg');
    this.options = {
      width,
      height,
      type,
      data
    };

    this.element.attr('width', width).attr('height', height);
    this.selectedData = [];
    // this.selectedData = this.options.data.slice(data.length - 100);

    this.children = [];
    this.initChildren();
    // this.render();
    this.initZoom();
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
        type: this.options.type
      });

      this.children.push(chart);
    }
  }

  // __bindEvents() {
  //   // change brush selection need to rerender all charts
  //   const brush = this.children[this.children.length - 1];

  //   brush.on('brush', this.handleBrush);

  //   brush.initBrushBehavior();
  // }

  getIndexScale() {
    var startIndex = 0;
    var endIndex = this.options.data.length - 1;
    var range = [0, this.options.width];
    var domain = [startIndex, endIndex];
    var indexScale = d3
      .scaleLinear()
      .domain(domain)
      .range(range);

    return indexScale;
  }

  initZoom() {
    var { width, height } = this.options;
    // 最初展示的K线数量
    var minStickLength = 30;
    // 最初展示的K线数量占总K线数量的百分比
    var percent = minStickLength / this.options.data.length;

    console.log('percent', percent);

    // 宽度占比，后面会根据缩放比例进行缩放
    var percentWidth = width * percent;

    // 索引——宽度 比例尺
    var indexScaleCopy = this.getIndexScale();

    // console.log(indexScaleCopy.domain());

    // 用于绑定缩放事件的容器
    var zoomer = this.element
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // 最大缩放比例
    var maxScale = this.options.width / percentWidth;
    // 初始缩放比例
    var initScale = maxScale;

    console.log('initScale', initScale);

    var startIndex = 0;
    var endIndex = this.options.data.length - 1;
    var zoomed = () => {
      var transform = d3.event.transform;
      var domain = transform.rescaleX(indexScaleCopy).domain();

      let [selectedStartIndex, selectedEndIndex] = domain;
      console.log(`当前数据范围: ${selectedStartIndex} - ${selectedEndIndex}`);

      if (selectedStartIndex < startIndex || selectedEndIndex > endIndex) {
        // throw new Error('索引错误');
        return;
      }

      selectedStartIndex = Math.round(selectedStartIndex);
      selectedEndIndex = Math.round(selectedEndIndex);

      let selectedData = this.options.data.slice(
        selectedStartIndex,
        selectedEndIndex
      );

      this.selectedData = selectedData;
      this.render();
    };

    // 初始化zoom行为
    var zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, height]])
      .scaleExtent([1, maxScale])
      .on('zoom', zoomed);

    // 设置初始的缩放和平移
    var initTransform = d3.zoomIdentity
      .scale(initScale)
      .translate(-(width - percentWidth), 0); // 一开始从最右侧，也就是最新的显示

    zoomer.call(zoom).call(zoom.transform, initTransform);
  }

  render() {
    console.log('render fired');
    this.children.forEach(child => child.render(this.selectedData));
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
    this.selectedData = [];
    this.initChildren();
    this.initZoom();
  }

  destroy() {
    this.children.forEach(child => child.element.remove());
    this.element.remove();
  }
}

export default CandleStickChart;
