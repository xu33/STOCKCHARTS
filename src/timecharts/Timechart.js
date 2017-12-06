import './timechart.css';
import * as d3 from 'd3';
import Mainchart from './AreaAndLine';
import Volume from './Volume';
import Crosshair from './Crosshair';
import Indicator from './Indicator';

const DIV = [0.7, 0.3];

class Timechart {
  static TYPES = [Mainchart, Volume];

  constructor(selector, options) {
    let { width, height } = options;

    this.element = d3.select(selector).append('svg');
    this.options = options;
    this.element.attr('height', height).attr('width', width);

    this.children = [];
    this.initChildren();
    this.render();
  }

  initChildren() {
    let { height: totalHeight, width: totalWidth, lastClose } = this.options;
    let types = Timechart.TYPES;
    let lastHeight = 0;

    types.forEach((type, i) => {
      let height = DIV[i] * totalHeight;
      let width = totalWidth;
      let x = 0;
      let y = lastHeight;

      lastHeight += height;

      let chart = new type(this.element, {
        x,
        y,
        width,
        height,
        lastClose
      });

      chart.parent = this;

      this.children.push(chart);
    });

    this.initCrosshair();
  }

  resize(size) {
    let totalWidth = size.width;
    let totalHeight = size.height;
    let lastHeight = 0;

    this.element.attr('width', totalWidth);
    this.element.attr('height', totalHeight);

    for (let i = 0; i < this.children.length; i++) {
      let height = DIV[i] * totalHeight;
      let width = totalWidth;
      let x = 0;
      let y = lastHeight;

      lastHeight += height;

      this.children[i].resize({
        x,
        y,
        width,
        height
      });
    }
  }

  // 初始化十字线交互
  initCrosshair() {
    // let { top, left, right, bottom } = AreaAndLine.defaultOptions.margin;

    const { width, height } = this.options;
    const top = Timechart.TYPES[0].defaultOptions.margin.top;
    const bottom = Timechart.TYPES[1].defaultOptions.margin.bottom;
    let left, right;

    for (let i = 0; i < Timechart.TYPES.length; i++) {
      if (!left) {
        left = Timechart.TYPES[i].defaultOptions.margin.left;
      } else {
        left = Math.max(left, Timechart.TYPES[i].defaultOptions.margin.left);
      }

      if (!right) {
        right = Timechart.TYPES[i].defaultOptions.margin.right;
      } else {
        right = Math.max(right, Timechart.TYPES[i].defaultOptions.margin.right);
      }
    }

    this.margin = { left, right, bottom, top };

    this.crosshair = new Crosshair(this.element, {
      x: left,
      y: top,
      width: width - left - right,
      height: height - top - bottom
    });

    let data = this.options.data;

    this.crosshair.on('move', mousePosition => {
      if (data.length < 1) return;

      this.children.forEach(child => {
        if (child.handleMouseMove) {
          child.handleMouseMove(mousePosition);
        }
      });
    });

    this.crosshair.on('end', () => {
      if (data.length < 1) return;

      if (this.options.onChange) {
        this.options.onChange(data[data.length - 1]);
      }
    });

    this.initIndicators();
  }

  // 初始化文字指示器
  initIndicators() {
    // 价格指示器
    this.priceIndicator = new Indicator(this.crosshair);
    // 涨幅指示器
    this.increaseIndicator = new Indicator(this.crosshair);
    // 时间指示器
    this.timeIndicator = new Indicator(this.crosshair);
  }

  // 渲染时间指示器
  updateTimeIndicator(x, currentDataItem) {
    let { top, left, right, bottom } = this.margin;
    let { width, height } = this.options;
    let y = height - top - bottom;

    this.timeIndicator.setText(
      d3.timeFormat('%H:%M')(currentDataItem.timestamp)
    );
    this.timeIndicator.setPosition(x, y, 'vertical');
  }

  // 渲染价格指示器
  updatePriceIndicator(y, currentDataItem) {
    let x = 0;
    let price = d3.format('.2f')(currentDataItem.current);

    this.priceIndicator.setText(price);
    this.priceIndicator.setPosition(x, y, 'horizontal', 'left');
  }

  // 渲染涨幅指示器
  updateIncreaseIndicator(y, currentDataItem) {
    let { top, left, right, bottom } = this.margin;
    let { width, height, lastClose } = this.options;
    let x = width - right - left;
    let price = currentDataItem.current;
    let increase = (price - lastClose) / lastClose;

    this.increaseIndicator.setText(d3.format('.2%')(increase));
    this.increaseIndicator.setPosition(x, y, 'horizontal', 'right');
  }

  render() {
    if (!this.options.data || this.options.data.length < 1) return;
    this.children.forEach(chart => chart.render(this.options.data));
  }

  destroy() {
    this.children.forEach(child => child.element.remove());
    this.element.remove();
  }

  redraw(data) {
    this.options.data = data;
    this.render();
  }

  update(item) {
    if (!Array.isArray(item)) {
      item = [item];
    }

    this.options.data = this.options.data.concat(item);

    this.render();
  }
}

// export default Timechart;
module.exports = Timechart;
