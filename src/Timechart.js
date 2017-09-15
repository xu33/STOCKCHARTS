const d3 = require('d3');
require('./css/timechart.css');

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

class Axis {
  constructor({ parentNode, type, bound, afterRender }) {
    this.group = parentNode.append('g');

    var axis;
    switch (type) {
      case 'left':
        axis = d3.axisLeft();
        break;
      case 'right':
        axis = d3.axisRight();
        break;
      case 'bottom':
        axis = d3.axisBottom();
        break;
      case 'top':
        axis = d3.axisTop();
        break;
      default:
        throw '数轴类型无效';
    }

    this.axis = axis.tickSize(0);
    this.group
      .attr('transform', `translate(${bound.x}, ${bound.y})`)
      .attr('class', 'axis');

    this.afterRender = afterRender;
  }

  setScale(scale) {
    this.axis.scale(scale);
  }

  render() {
    this.group.call(this.axis);

    if (this.afterRender) {
      this.afterRender();
    }
  }
}

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
    this.initAxises();
  }

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

  makeBottomAxisScale() {
    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height } = this.options;
    let x1 = 0;
    let x2 = width - left - right;
    let mid = (x2 - x1) / 2;
    let domain = ['09:30', '13:00', '15:00'];

    let scale = d3
      .scaleOrdinal()
      .domain(['09:30', '13:00', '15:00'])
      .range([x1, mid, x2]);

    return scale;
  }

  makeLeftAxisScale() {
    let xrange = this.scaleX.range();
    let range = linspace(xrange[0], xrange[1], 3);

    return d3.scaleOrdinal().range(range);
  }

  // getRightAxisScale() {
  //   let yrange = this.scaleY.range();
  //   let range = linspace(yrange[0], yrange[1], 3);

  //   return d3.scaleOrdinal().range(range);
  // }

  // make_x_gridlines() {
  //   return d3.axisBottom(this.scaleX).ticks(2);
  // }

  // make_y_gridlines() {
  //   return d3.axisLeft(this.scaleY).ticks(5);
  // }

  addGridLines() {
    let { width, height } = this.options;
    let { margin } = Timechart.defaultOptions;
    // this.svg
    //   .append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', `translate(0, ${height})`)
    //   .attr('class', 'grid')
    //   .call(
    //     this.make_x_gridlines()
    //       .tickSize(-height)
    //       .tickFormat('')
    //   );

    this.svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'grid')
      .call(
        this.make_y_gridlines()
          .tickSize(-width)
          .tickFormat('')
      );
  }

  initAxises() {
    let { top, left, right, bottom } = Timechart.defaultOptions.margin;
    let { width, height } = this.options;

    // 底部数轴
    this.bottomAxis = new Axis({
      parentNode: this.svg,
      type: 'bottom',
      afterRender: function() {
        let g = this.group;
        g.selectAll('.tick text').each(function(d, i) {
          if (i == 0) d3.select(this).attr('text-anchor', 'start');
          if (i == 2) d3.select(this).attr('text-anchor', 'end');
        });
      },
      bound: {
        x: left,
        y: height - bottom
      }
    });

    this.bottomAxis.setScale(this.makeBottomAxisScale());
    this.bottomAxis.render();

    // 左侧数轴
    this.leftAxis = new Axis({
      parentNode: this.svg,
      type: 'right',
      bound: {
        x: left,
        y: top
      }
    });

    this.leftAxis.setScale(this.scaleY);
    this.leftAxis.render();

    // // 右侧数轴
    // this.rightAxis = new Axis({
    //   parentNode: this.svg,
    //   type: 'left',
    //   bound: {
    //     x: width - right,
    //     y: top
    //   }
    // });

    // this.rightAxis.setScale(this.getRightAxisScale());
    // this.rightAxis.axis.tickFormat(d3.format('.2%'));
    // this.rightAxis.render();
  }

  render() {
    this.renderChartArea();

    // this.leftAxis.setScale(this.scaleY);
    // this.leftAxis.render();

    // this.scaleYCopy.domain(this.ratioDomain);
    // this.rightAxis.setScale(this.scaleYCopy);
    // this.rightAxis.render();
  }

  renderChartArea() {
    let { scaleX, scaleY, options: { data } } = this;

    scaleX.domain([0, 241]);

    // 可能要改为根据前一天收盘价计算涨跌幅
    let start = data[0].current;
    let extent = d3.extent(data, d => d.current);

    let ratioExtent = Math.max(
      Math.abs(extent[0] - start) / start,
      Math.abs(extent[1] - start) / start
    );

    let ratioDomain = [1 - ratioExtent * 1.5, 1 + ratioExtent * 1.5];
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
}

export default Timechart;
