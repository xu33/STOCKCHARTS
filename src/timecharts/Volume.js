const d3 = require('d3');

import { linspace } from '../utils/linspace';

class Volume {
  static START_INDEX = 0;
  static END_INDEX = 241;
  static PERCENT = 0.24;

  constructor(parentNode, { x, y, width, height, data }) {
    this.element = parentNode.append('g').attr('class', 'volume_chart');
    this.element.attr('transform', `translate(${x}, ${y})`);
    this.scaleX = d3
      .scaleLinear()
      .range([1, width])
      .domain([Volume.START_INDEX, Volume.END_INDEX]);
    this.scaleY = d3.scaleLinear().range([height, 0]);

    this.data = data;
    this.width = width;
    this.height = height;

    this.renderGrids();
  }

  render() {
    let { scaleX, scaleY, width, height, data } = this;
    let extent = d3.extent(data, d => d.volume);

    extent[1] = extent[1] * 1.2;

    scaleY.domain(extent);

    let selection = this.element
      .selectAll('.volume')
      .data(this.data, d => d.timestamp);

    selection.exit().remove();

    selection
      .enter()
      .append('line')
      .merge(selection)
      .attr('class', 'volume')
      .attr('x1', (d, i) => scaleX(i))
      .attr('y1', d => scaleY(d.volume))
      .attr('x2', (d, i) => scaleX(i))
      .attr('y2', height);
  }

  renderGrids() {
    // 左至右
    let gridGroup = this.element.append('g').attr('class', 'axis');
    let domain = [1, 2, 3];
    let range = linspace(this.height - 1, 0, 3);
    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);
    let axis = d3
      .axisLeft(scale)
      .tickSize(-this.width)
      .tickFormat('');

    gridGroup.call(axis);

    // 下至上
    let gridGroupBottom = this.element
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.height})`);
    let domain1 = [1, 2, 3];
    let range1 = linspace(0, this.width - 1, 3);
    let scale1 = d3
      .scaleOrdinal()
      .domain(domain1)
      .range(range1);
    let axisBottom = d3
      .axisBottom(scale1)
      .tickSize(-this.height)
      .tickFormat('');

    gridGroupBottom.call(axisBottom);
  }

  update(item) {
    if (!Array.isArray(item)) {
      item = [item];
    }
    for (var i = 0; i < item.length; i++) {
      this.data.push(item[i]);
    }
    this.render();
  }
}

export default Volume;
