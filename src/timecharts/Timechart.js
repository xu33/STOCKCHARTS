import './timechart.css';
import * as d3 from 'd3';

import Volume from './Volume';
import Mainchart from './Mainchart';

class Timechart {
  static defaultOptions = {
    margin: {
      top: 0,
      left: 5,
      right: 0,
      bottom: 20
    }
  };

  constructor(selector, options) {
    this.element = d3.select(selector).append('svg');

    this.options = options;

    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height, data } = this.options;

    this.element.attr('height', height).attr('width', width);

    const volumeHeight = Volume.PERCENT * options.height;
    const chartHeight = options.height - volumeHeight;

    this.main = new Mainchart(this.element, {
      ...options,
      height: chartHeight
    });

    this.volume = new Volume(this.element, {
      x: left,
      y: chartHeight,
      width: width - left - right,
      height: volumeHeight
    });
  }

  render() {
    this.main.render(this.options.data);
    this.volume.render(this.options.data);
  }

  update(item) {
    if (!Array.isArray(item)) {
      item = [item];
    }

    this.options.data = [...this.options.data, ...item];

    this.render();
  }
}

export default Timechart;
