import './timechart.css';
import * as d3 from 'd3';
import Mainchart from './AreaAndLine';
import Volume from './Volume';

const DIV = [0.8, 0.2];

class Timechart {
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
    let types = [Mainchart, Volume];
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
  }

  render() {
    if (!this.options.data || this.options.data.length < 1) return;
    this.children.forEach(chart => chart.render(this.options.data));
  }

  destroy() {
    this.children.forEach(child => child.element.remove());
    this.element.remove();
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
