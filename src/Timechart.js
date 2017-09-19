const d3 = require('d3');
require('./css/timechart.css');

import Crosshair from './timecharts/Crosshair';

function linspace(a, b, n) {
  if (typeof n === 'undefined') n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,
    ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}

const OVERFLOW_RATIO = 1.2;

class Timechart {
  static START_INDEX = 0;
  static END_INDEX = 241;

  static defaultOptions = {
    margin: {
      top: 0,
      left: 5,
      right: 0,
      bottom: 20
    }
  };

  constructor(selector, options) {
    this.element = d3.select(selector);
    this.options = {
      ...Timechart.defaultOptions,
      ...options
    };

    this.svg = this.element.append('svg');
    this.svg.attr('height', this.options.height);
    this.svg.attr('width', this.options.width);

    this.initScales();
    this.initLines();
    this.initAxisGroups();
    this.initCrosshair();
  }

  // 初始化十字线交互
  initCrosshair() {
    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height } = this.options;

    this.crosshair = new Crosshair(this.svg, {
      x: left,
      y: top,
      width: width - left - right,
      height: height - top - bottom
    });

    this.crosshair.on('mousemove', mousePosition => {});
  }

  // 初始化放置数轴的容器
  initAxisGroups() {
    // 初始化数轴容器
    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height } = this.options;

    this.leftAxisGroup = this.svg
      .append('g')
      .attr('class', 'axis left_axis_group')
      .attr('transform', `translate(${left}, ${top})`);

    this.rightAxisGroup = this.svg
      .append('g')
      .attr('class', 'axis right_axis_group')
      .attr('transform', `translate(${width - right - 1}, ${top})`);

    this.bottomAxisGroup = this.svg
      .append('g')
      .attr('class', 'axis bottom_axis_group')
      .attr('transform', `translate(${left}, ${height - bottom})`);

    // 初始化辅助线
    let range = linspace(height - top - bottom - 1, 0, 5);
    let scale = d3
      .scaleOrdinal()
      .range(range)
      .domain([1, 2, 3, 4, 5]);

    let grid_x = this.svg
      .append('g')
      .attr('class', 'grid grid_x')
      .attr('transform', `translate(${left}, ${top})`);
    let axis = d3
      .axisLeft(scale)
      .tickSize(-(width - right))
      .tickFormat('');

    grid_x.call(axis);

    let range_y = linspace(0, width - right - left - 1, 3);
    let scale_y = d3
      .scaleOrdinal()
      .range(range_y)
      .domain([1, 2, 3]);
    let grid_y = this.svg
      .append('g')
      .attr('class', 'grid grid_y')
      .attr('transform', `translate(${left}, ${top})`);
    let axis_y = d3
      .axisTop(scale_y)
      .tickSize(-(height - top - bottom))
      .tickFormat('');

    grid_y.call(axis_y);
  }

  // 绘制图形区域需要的比例尺
  initScales() {
    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height } = this.options;
    this.scaleX = d3.scaleLinear().range([0 + left, width - right]);
    this.scaleY = d3.scaleLinear().range([height - top - bottom, 0 + top]);
  }

  initLines() {
    // 现价分时线描边
    this.svg.append('path').attr('class', 'avg_line');
    // 现价分时线填充
    this.svg.append('path').attr('class', 'area_fill');
    // 均价线
    this.svg.append('path').attr('class', 'area_stroke');
  }

  renderAxises() {
    this.renderLeftAndRightAxis();
    this.renderBottomAxis();
  }

  renderLeftAndRightAxis() {
    let { width, height } = this.options;
    let { left, right, bottom, top } = Timechart.defaultOptions.margin;
    let range = linspace(height - top - bottom, 0, 3);

    // 左数轴
    let priceDomain = linspace(this.priceDomain[0], this.priceDomain[1], 3);
    let scaleLeft = d3
      .scaleOrdinal()
      .range(range)
      .domain(priceDomain);
    let axisLeft = d3
      .axisRight(scaleLeft)
      .tickFormat(d3.format('.2f'))
      .tickSize(0);

    this.leftAxisGroup.call(axisLeft);

    // 右数轴
    let ratioDomain = linspace(this.ratioDomain[0], this.ratioDomain[1], 3);

    ratioDomain[1] = 0;

    let scaleRight = d3
      .scaleOrdinal()
      .range(range)
      .domain(ratioDomain);
    let axisRight = d3
      .axisLeft(scaleRight)
      .tickFormat(d3.format('.2%'))
      .tickSize(0);

    this.rightAxisGroup.call(axisRight);

    // 调整刻度文字位置
    this.leftAxisGroup.selectAll('.tick text').each(function(d, i) {
      let selection = d3.select(this);
      if (i <= 1) {
        selection.attr('transform', 'translate(0, -10)');
      } else {
        selection.attr('transform', 'translate(0, 10)');
      }

      if (i > 1) {
        selection.attr('class', 'up');
      } else if (i < 1) {
        selection.attr('class', 'down');
      } else {
        selection.attr('class', 'eq');
      }
    });

    this.rightAxisGroup.selectAll('.tick text').each(function(d, i) {
      let selection = d3.select(this);
      if (i <= 1) {
        selection.attr('transform', 'translate(0, -10)');
      } else {
        selection.attr('transform', 'translate(0, 10)');
      }

      if (d > 0) {
        selection.attr('class', 'up');
      } else if (d < 0) {
        selection.attr('class', 'down');
      } else {
        selection.attr('class', 'eq');
      }
    });
  }

  renderBottomAxis() {
    let { width, height } = this.options;
    let { left, right, bottom, top } = Timechart.defaultOptions.margin;
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

    this.bottomAxisGroup.call(axis);

    // 调整刻度文字位置
    this.bottomAxisGroup.selectAll('.tick text').each(function(d, i) {
      if (i === 0) {
        d3.select(this).attr('transform', 'translate(15, 0)');
      } else if (i === 2) {
        d3.select(this).attr('transform', 'translate(-15, 0)');
      }
    });
  }

  render() {
    if (this.options.data.length < 1) return;
    this.renderChartArea();
    this.renderAxises();
  }

  renderChartArea() {
    let { scaleX, scaleY, options: { data } } = this;

    scaleX.domain([0, 241]);

    // 可能要改为根据前一天收盘价计算涨跌幅
    let start = this.options.lastClose;
    let extent = d3.extent(data, d => d.current);

    let ratioExtent = Math.max(
      Math.abs(extent[0] - start) / start,
      Math.abs(extent[1] - start) / start
    );

    let ratioDomain = [
      1 - ratioExtent * OVERFLOW_RATIO,
      1 + ratioExtent * OVERFLOW_RATIO
    ];

    this.ratioDomain = ratioDomain.map(n => n - 1);

    let priceDomain = [start * ratioDomain[0], start * ratioDomain[1]];
    this.priceDomain = priceDomain;

    scaleY.domain(priceDomain);

    let area = d3
      .area()
      .x((d, i) => scaleX(i))
      .y0(d => scaleY(d.current))
      .y1(scaleY.range()[0]);

    let line = d3
      .line()
      .x((d, i) => scaleX(i))
      .y(d => scaleY(d.current));

    let lineAvg = d3
      .line()
      .x((d, i) => scaleX(i))
      .y(d => scaleY(d.avg_price));

    this.svg.select('.area_fill').attr('d', area(data));
    this.svg.select('.area_stroke').attr('d', line(data));
    this.svg.select('.avg_line').attr('d', lineAvg(data));
  }

  update(item) {
    if (!Array.isArray(item)) {
      item = [item];
    }

    for (var i = 0; i < item.length; i++) {
      this.options.data.push(item[i]);
    }

    this.render();
  }
}

export default Timechart;
