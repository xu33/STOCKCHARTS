import * as d3 from 'd3';
import colors from './colors';
import { linspace } from '../utils/linspace';

function calColor(d) {
  if (d.close > d.open) {
    return colors.WIN_COLOR;
  } else if (d.close < d.open) {
    return colors.LOSS_COLOR;
  } else {
    return colors.EQUAL_COLOR;
  }
}

class Volumes {
  static margin = {
    left: 40,
    right: 40,
    top: 0,
    bottom: 10
  };

  constructor(parentNode, { x, y, width, height }) {
    const { left, right, top, bottom } = Volumes.margin;

    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom
    };

    let translateX = x + left;
    let translateY = y + top;
    this.element = parentNode.append('g');
    this.element.attr('transform', `translate(${translateX}, ${translateY})`);
    this.initScales();
  }

  resize(bound) {
    var { left, right, top, bottom } = Volumes.margin;

    this.options = {
      ...this.options,
      x: bound.x,
      y: bound.y,
      width: bound.width - left - right,
      height: bound.height - top - bottom
    };

    var tx = bound.x + left;
    var ty = bound.y + top;
    this.element.attr('transform', `translate(${tx}, ${ty})`);
    this.initScales();
    this.render(this.data);
  }

  initScales() {
    let { left, right, top, bottom } = Volumes.margin;
    let { width, height } = this.options;
    let range_volume = [height, 0];
    let range_x = [0, width];

    this.scale_volume = d3.scaleLinear().range(range_volume);
    this.scale_band = d3
      .scaleBand()
      .range(range_x)
      .padding(0.2);

    // 边框&辅助线
    this.render_grids();
  }

  render_grids() {
    this.render_grids_x();
    this.render_grids_y();
  }

  render_grids_x() {
    let { width, height } = this.options;

    let group = this.element.select('g.xgrid');

    if (group.empty()) {
      group = this.element.append('g');
    }

    group
      .attr('class', 'axis xgrid')
      .attr('transform', `translate(0, ${height})`);

    let scale = d3
      .scaleOrdinal()
      .range(linspace(0, width - 1, 3))
      .domain([1, 2, 3]);

    let axis = d3
      .axisBottom(scale)
      .tickSize(-height)
      .tickFormat('');

    group.call(axis);
  }

  render_grids_y() {
    let { width, height } = this.options;
    let group = this.element.select('g.ygrid');

    if (group.empty()) {
      group = this.element.append('g');
    }

    group.attr('class', 'axis ygrid');

    let scale = d3
      .scaleOrdinal()
      .range(linspace(0, height, 3))
      .domain([1, 2, 3]);

    let axis = d3
      .axisLeft(scale)
      .tickSize(-width)
      .tickFormat('');

    group.call(axis);
  }

  render(data) {
    let { width, height } = this.options;
    let { scale_band, scale_volume } = this;

    let domain_x = data.map((o, i) => i);

    scale_band.domain(domain_x);

    let domain_volume = d3.extent(data, d => d.volume);
    scale_volume.domain(domain_volume);

    let selection = this.element.selectAll('.bar').data(data);
    selection.exit().remove();

    let bandwidth = scale_band.bandwidth();

    if (bandwidth <= 1) bandwidth = 1;

    selection
      .enter()
      .append('rect')
      .merge(selection)
      .attr('class', 'bar')
      .attr('x', (d, i) => scale_band(i))
      .attr('y', d => scale_volume(d.volume))
      .attr('width', scale_band.bandwidth())
      .attr('height', d => height - scale_volume(d.volume))
      .attr('fill', calColor);

    this.data = data;
  }
}

export default Volumes;
