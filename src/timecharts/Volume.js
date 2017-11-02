import * as d3 from 'd3';
import { linspace } from '../utils/linspace';

class Volume {
  static START_INDEX = 0;
  static END_INDEX = 241;

  static defaultOptions = {
    margin: {
      top: 0,
      left: 50,
      right: 50,
      bottom: 6
    }
  };

  static styles = {
    RED: '#c10',
    GREEN: '#383'
  };

  constructor(parentNode, options) {
    let { x, y, width, height, lastClose } = options;
    let { top, left, right, bottom } = Volume.defaultOptions.margin;

    this.options = options;
    this.element = parentNode.append('g').attr('class', 'volume_chart');
    this.element.attr('transform', `translate(${x + left}, ${y + top})`);

    this.width = width - left - right;
    this.height = height - top - bottom;

    this.scaleX = d3
      .scaleLinear()
      .range([1, this.width])
      .domain([Volume.START_INDEX, Volume.END_INDEX]);
    this.scaleY = d3.scaleLinear().range([this.height, 0]);

    this.renderGrids();

    this.initAxis();
  }

  initAxis() {
    let { height, width } = this;

    this.element
      .append('g')
      .attr('class', 'axis left_axis_group')
      .attr('transform', `translate(0, 0)`);

    this.element
      .append('g')
      .attr('class', 'axis right_axis_group')
      .attr('transform', `translate(${width}, 0)`);

    let range = linspace(height, 0, 3);
    let scale = d3.scaleOrdinal().range(range);

    this.axisScale = scale;
  }

  render(data) {
    let lastClose = this.options.lastClose;
    let { scaleX, scaleY, width, height } = this;
    let extent = d3.extent(data, d => d.volume);

    extent[1] = extent[1] * 1.2;

    scaleY.domain(extent);

    let selection = this.element
      .selectAll('.volume')
      .data(data, d => d.timestamp);

    selection.exit().remove();

    let prev = null;
    selection
      .enter()
      .append('line')
      .merge(selection)
      .attr('fill', 'none')
      .attr('stroke', (d, i) => {
        let color;
        if (i === 0) {
          if (d.current >= lastClose) {
            color = Volume.styles.RED;
          } else {
            color = Volume.styles.GREEN;
          }
        } else {
          if (d.current >= prev.current) {
            color = Volume.styles.RED;
          } else {
            color = Volume.styles.GREEN;
          }
        }

        prev = d;

        return color;
      })
      .attr('x1', (d, i) => scaleX(i))
      .attr('y1', d => scaleY(d.volume))
      .attr('x2', (d, i) => scaleX(i))
      .attr('y2', height);

    this.renderAxis(data);
  }

  renderAxis(data) {
    let domain = d3.extent(data, d => d.volume);

    domain = linspace(...domain, 3);

    domain = domain.map(n => n / 1e4);

    this.axisScale.domain(domain);

    let leftAxis = d3
      .axisLeft(this.axisScale)
      .tickFormat(d3.format('.2f'))
      .tickSize(0);

    let rightAxis = d3
      .axisRight(this.axisScale)
      .tickFormat(d3.format('.2f'))
      .tickSize(0);

    this.element.select('.left_axis_group').call(leftAxis);
    this.element.select('.right_axis_group').call(rightAxis);
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
}

export default Volume;
