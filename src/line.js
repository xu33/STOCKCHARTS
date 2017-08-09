const d3 = require('d3');

import './css/line.css'

class LineChart {
  static defaultOptions = {
    containerWidth: 500,
    containerHeight: 300,
    lineColor: '#6db5f1',
    leftMargin: 20,
    bottomMargin: 20,
    margin: {
      left: 30,
      bottom: 20,
      right: 10,
      top: 5
    }
  }

  constructor(container, options) {
    this.container = d3.select(container);
    this.svg = this.container.append('svg');
    this.options = {
      ...LineChart.defaultOptions,
      ...options
    };

    let { containerWidth, containerHeight } = this.options;
    let { left, right, bottom, top } = this.options.margin;

    this.svg.attr('width', containerWidth).attr('height', containerHeight);
    this.chartGroup = this.svg.append('g').attr('transform', `translate(${left}, ${top})`);
    this.chartWidth = containerWidth - left - right;
    this.chartHeight = containerHeight - top - bottom;
    this.data = options.data;

    this.render();
  }

  render() {
    this.initScale();
    this.renderChart();
    this.renderAxis();
    this.initCrosshair();
    this.createEventOverlay();
  }

  renderAxis() {
    this.renderLeftAxis();
    this.renderBottomAxis();
  }

  createEventOverlay() {
    let { tooltip } = this.options;
    let div = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none')
    let crosshair = this.crosshair;
    let bisect = d3.bisector(d => d.date).left;
    let that = this;

    this.chartGroup.append('rect')
      .attr('class', 'overlay')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .on('mouseover', function () {
        div.style('display', null);
        crosshair.style('display', null);
      })
      .on('mousemove', function () {
        let { scaleX, scaleY, domainX, domainY, domainYFix, data } = that;
        let mouseDate = scaleX.invert(d3.mouse(this)[0]);
        let index = bisect(data, mouseDate); // 返回当前这个数据项的索引

        // console.log(`index:${index}`);

        let d0 = data[index - 1];
        let d1 = data[index];
        let d;
        if (!d0) {
          d = d1;
        } else {
          d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
        }

        let x = scaleX(d.date);
        let y = scaleY(d.urRatio);

        div.html(tooltip(d));
        div.style('left', `${d3.event.pageX + 10}px`);
        div.style('top', `${d3.event.pageY - 10}px`);

        crosshair.select('#crossLineX')
          .attr('x1', x).attr('y1', 0)
          .attr('x2', x).attr('y2', that.chartHeight);

        crosshair.select('#crossLineY')
          .attr('x1', 0).attr('y1', y)
          .attr('x2', that.chartWidth).attr('y2', y);

        crosshair.select('#crossCenter')
          .attr('cx', x)
          .attr('cy', y);
      })
      .on('mouseout', function () {
        div.style('display', 'none');
        crosshair.style('display', 'none');
      })
  }

  initCrosshair() {
    let crosshair = this.chartGroup.append('g').style('display', 'none');
    crosshair.append('line')
      .attr('class', 'crossline')
      .attr('id', 'crossLineX');

    crosshair.append('line')
      .attr('class', 'crossline')
      .attr('id', 'crossLineY');

    crosshair.append('circle')
      .attr('class', 'circle')
      .attr('r', 5)
      .attr('id', 'crossCenter')

    this.crosshair = crosshair;
  }

  renderLeftAxis() {
    const leftAxisGroup = this.chartGroup.append('g')
      .attr('class', 'chart-axis')
      .attr('id', 'leftAxis');

    const leftAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(0).tickPadding(4);

    leftAxisGroup.call(leftAxis);

    leftAxisGroup.selectAll('text').attr('transform', (d, i) => {
      if (i === 4) {
        return `translate(${0}, ${5})`;
      } else {
        return ``;
      }
    })

    this.leftAxis = leftAxis;

    const rightAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis').attr('transform', `translate(${this.chartWidth}, 0)`);
    const rightAxis = d3.axisLeft(this.fixLengthScaleY).tickSize(this.chartWidth).tickFormat('');
    rightAxisGroup.call(rightAxis);
  }

  renderBottomAxis() {
    const bottomAxisGroup = this.chartGroup.append('g')
      .attr('class', 'chart-axis')
      .attr('id', 'bottomAxis');

    const bottomAxis = d3.axisBottom(this.scaleX).tickSize(0).tickPadding(4);

    this.bottomAxisGroup = bottomAxisGroup;
    this.bottomAxis = bottomAxis;

    bottomAxis.ticks(5);

    bottomAxisGroup.call(bottomAxis.tickFormat(d3.timeFormat("%H:%M"))).attr('transform', `translate(0, ${this.chartHeight})`);
  }

  initScale() {
    let domainX = d3.extent(this.data, d => d.date);
    // let domainY = d3.extent(this.data, d => d.urRatio);
    let domainY = [-1, 2];
    let scaleX = d3.scaleTime().domain(domainX).range([0, this.chartWidth]);
    let scaleY = d3.scaleLinear().domain(domainY).range([this.chartHeight, 0]);

    let domainYFix = linspace(domainY[0], domainY[1], 5).map(o => o.toFixed(2));
    let rangeFix = linspace(this.chartHeight, 0, 5);
    let fixLengthScaleY = d3.scaleOrdinal().domain(domainYFix).range(rangeFix);

    this.domainX = domainX;
    this.domainY = domainY;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.domainYFix = domainYFix;
    this.fixLengthScaleY = fixLengthScaleY;
  }

  renderChart() {
    let lineChartGroup = this.chartGroup.append('g');
    let { scaleX, scaleY } = this;
    let lineFn = d3.line()
      .x((d) => scaleX(d.date))
      .y((d) => scaleY(d.urRatio));

    lineChartGroup
      .append('path')
      .attr('class', 'ratio-line')
      .datum(this.data)
      .attr('d', lineFn)
      .attr('fill', 'none')
      .attr('stroke', this.options.lineColor);
  }

  addData(data) {
    this.data = [...this.data, ...data];

    this.rescale();
    this.updateChart();
  }

  updateData(data) {
    this.data = data;
    this.rescale();
    this.updateChart();
  }

  rescale() {
    let domainX = d3.extent(this.data, d => d.date);
    this.scaleX.domain(domainX);

    this.bottomAxisGroup.call(
      this.bottomAxis.tickFormat(d3.timeFormat("%H:%M"))
    )
  }

  updateChart() {
    let scaleX = this.scaleX;
    let scaleY = this.scaleY;

    let lineFn = d3.line()
      .x((d) => scaleX(d.date))
      .y((d) => scaleY(d.urRatio));

    this.chartGroup.select('.ratio-line')
      .datum(this.data)
      .attr('d', lineFn);
  }
}

function linspace(a, b, n) {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) { return n === 1 ? [a] : []; }
  var i, ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) { ret[i] = (i * b + (n - i) * a) / n; }
  return ret;
}

module.exports = LineChart;