import * as d3 from 'd3';

import CandleStickMain from './CandleStickMain';
import Volumes from './Volumes';
import Dragbar from './Dragbar';

class CandleStickChart {
  // 每个子图形占比
  static DIV = [0.6, 0.2, 0.2];

  constructor(selector, { width, height, data }) {
    this.element = d3.select(selector).append('svg');
    this.options = {
      width,
      height,
      data
    };

    this.element.attr('width', width).attr('height', height);

    this.initChildren();
  }

  initChildren() {
    this.children = [];

    let data = this.options.data;
    let totalHeight = this.options.height;
    let totalWidth = this.options.width;
    let types = [CandleStickMain, Volumes, Dragbar];

    // 前一个图形的高度
    let lastHeight = 0;

    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let height = CandleStickChart.DIV[i] * totalHeight;
      let width = totalWidth;
      let x = 0;
      let y = lastHeight;

      // 下一个图形的y坐标等于上一个子图形的高度，外边距由每个图块自己处理
      lastHeight += height;

      // console.log({
      //   x,
      //   y,
      //   width,
      //   height
      // });

      let chart = new type(this.element, {
        x,
        y,
        width,
        height,
        data
      });

      this.children.push(chart);
    }
  }

  render() {
    this.children.forEach(child => child.render());
  }

  update(items) {
    this.children.forEach(child => {
      child.update(items);
    });
  }
}

export default CandleStickChart;
