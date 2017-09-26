import '../css/stock-chart.css';
import * as d3 from 'd3';
import CandleSticks from './CandleSticks';
import Volumes from './Volumes';
import Dragbar from './Dragbar';

class CandleStickChart {
  // 每个子图形占比
  static DIV = [0.7, 0.2, 0.1];

  handleBrush = ({ brushSelection, range }) => {
    let startIndex = 0;
    let endIndex = this.options.data.length - 1;
    let indexScale = d3
      .scaleLinear()
      .domain([startIndex, endIndex])
      .range(range);

    let domain = brushSelection.map(value => indexScale.invert(value));
    let [selectedStartIndex, selectedEndIndex] = domain;
    if (selectedStartIndex < startIndex || selectedEndIndex > endIndex) {
      throw new Error('索引错误');
    }

    selectedStartIndex = Math.round(selectedStartIndex);
    selectedEndIndex = Math.round(selectedEndIndex);

    console.log(`当前数据范围:${selectedStartIndex} - ${selectedEndIndex}`);

    // 至少显示30根K线
    if (selectedEndIndex - selectedStartIndex < 30) {
      return;
    }

    let selectedData = this.options.data.slice(
      selectedStartIndex,
      selectedEndIndex
    );

    this.currentBrushSelection = brushSelection;
    this.currentRange = range;
    this.selectedData = selectedData;
    this.render();
  };

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
    this.children = [];
    this.initChildren();
    this.bindEvents();
  }

  initChildren() {
    let totalHeight = this.options.height;
    let totalWidth = this.options.width;
    let types = [CandleSticks, Volumes, Dragbar];

    // 前一个图形的高度
    let lastHeight = 0;

    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let height = CandleStickChart.DIV[i] * totalHeight;
      let width = totalWidth;
      let x = 0;
      let y = lastHeight;

      // 下一个图形的y坐标等于上面图形高度的和，外边距由每个图形自己处理
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

  bindEvents() {
    // change brush selection need to rerender all charts
    const brush = this.children[this.children.length - 1];

    brush.on('brush', this.handleBrush);

    brush.initBrushBehavior();
  }

  render() {
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
    this.bindEvents();
  }

  destroy() {
    this.children.forEach(child => child.element.remove());
    this.element.remove();
  }
}

export default CandleStickChart;
