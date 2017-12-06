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
      bottom: 20
    }
  };

  static styles = {
    RED: '#c10',
    GREEN: '#383'
  };

  constructor(parentNode, options) {
    let { x, y } = options;
    let { top, left, right, bottom } = Volume.defaultOptions.margin;

    this.options = options;
    this.element = parentNode.append('g').attr('class', 'volume_chart');
    this.element.attr('transform', `translate(${x + left}, ${y + top})`);

    this.initScales();
    this.renderGrids();

    this.initAxis();
  }

  initScales() {
    let { top, left, right, bottom } = Volume.defaultOptions.margin;
    let width = this.options.width - left - right;
    let height = this.options.height - bottom;

    this.scaleX = d3
      .scaleLinear()
      .range([0, width])
      .domain([Volume.START_INDEX, Volume.END_INDEX]);

    this.scaleY = d3.scaleLinear().range([height, 0]);
  }

  // 缩放
  resize(bound) {
    let { top, left, right, bottom } = Volume.defaultOptions.margin;
    let { x, y, width, height } = bound;

    this.options = {
      ...this.options,
      x,
      y,
      width,
      height
    };

    this.element.attr('transform', `translate(${x + left}, ${y + top})`);
    this.initScales();
    this.initAxis();

    this.render(this.data);
  }

  initAxis() {
    let { top, left, right, bottom } = Volume.defaultOptions.margin;
    let { height, width } = this.options;

    this.element.selectAll('.axis').remove();

    // 左侧轴
    this.element
      .append('g')
      .attr('class', 'axis left_axis_group')
      .attr('transform', `translate(0, 0)`);

    // 右侧轴
    let x = width - left - right;
    this.element
      .append('g')
      .attr('class', 'axis right_axis_group')
      .attr('transform', `translate(${x}, 0)`);

    // 底部轴
    let y = height - top - bottom;
    this.element
      .append('g')
      .attr('class', 'axis bottom_axis_group')
      .attr('transform', `translate(0, ${y})`);

    let range = linspace(height - top - bottom, 0, 3);
    let scale = d3.scaleOrdinal().range(range);

    this.axisScale = scale;
  }

  render(data) {
    this.data = data;

    let { scaleX, scaleY } = this;
    let { bottom } = Volume.defaultOptions.margin;
    let { width, height, lastClose } = this.options;
    let extent = d3.extent(data, d => d.volume);

    // extent[1] = extent[1] * 1.2;

    scaleY.domain(extent);

    let selection = this.element
      .selectAll('.volline')
      .data(data, d => d.timestamp);

    let prev = null;
    let y2 = height - bottom;

    selection
      .enter()
      .append('line')
      .attr('class', 'volline')
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
      .attr('y2', y2);

    selection.exit().remove();

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

    this.renderBottomAxis();
  }

  renderBottomAxis() {
    let { width, height } = this.options;
    let { left, right, bottom, top } = Volume.defaultOptions.margin;
    let range = linspace(0, width - left - right, 3);
    let domain = ['09:30', '13:00', '15:00'];

    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);

    let axis = d3
      .axisBottom(scale)
      .tickSize(0)
      .tickPadding(5);

    let bottomAxisGroup = this.element.select('.bottom_axis_group');
    bottomAxisGroup.call(axis);

    // 调整刻度文字位置
    bottomAxisGroup.selectAll('.tick text').each(function(d, i) {
      if (i === 0) {
        d3.select(this).attr('transform', 'translate(15, 0)');
      } else if (i === 2) {
        d3.select(this).attr('transform', 'translate(-15, 0)');
      }
    });
  }

  renderGrids() {
    // 左至右
    let { left, right, bottom, top } = Volume.defaultOptions.margin;
    let width = this.options.width - left - right;
    let height = this.options.height - top - bottom;

    this.element.selectAll('.grid').remove();

    let gridGroup = this.element.append('g').attr('class', 'grid');
    let domain = [1, 2, 3];
    let range = linspace(height - 1, 0, 3);
    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);
    let axis = d3
      .axisLeft(scale)
      .tickSize(-width)
      .tickFormat('');

    gridGroup.call(axis);

    // 下至上
    let gridGroupBottom = this.element
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`);
    let domain1 = [1, 2, 3];
    let range1 = linspace(0, width - 1, 3);
    let scale1 = d3
      .scaleOrdinal()
      .domain(domain1)
      .range(range1);

    let axisBottom = d3
      .axisBottom(scale1)
      .tickSize(-height)
      .tickFormat('');

    gridGroupBottom.call(axisBottom);
  }
}

export default Volume;
