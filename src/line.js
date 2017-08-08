import * as d3 from 'd3';

import {
  startData,
  data as huiceData
} from './fake_data/data.js'

import './css/line.css'

class LineChart {
  static defaultOptions = {
    containerWidth: 500,
    containerHeight: 300,
    lineColor: '#6db5f1',
    leftMargin: 20,
    bottomMargin: 20,
    margin: {
      left: 20,
      bottom: 20,
      right: 0,
      top: 0
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
    // this.data.forEach(o => {
    //   console.log(o.date);
    //   o.date = d3.timeParse('%M:%SZ')(o.date)
    // });

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
    let { scaleX, scaleY, domainX, domainY, data } = this;
    let { tooltip } = this.options;
    let div = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none')
    let crosshair = this.crosshair;
    let bisect = d3.bisector(d => d.date).left;

    this.chartGroup.append('rect')
      .attr('class', 'overlay')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .on('mouseover', function () {
        div.style('display', null);
        crosshair.style('display', null);
      })
      .on('mousemove', function () {
        let mouseDate = scaleX.invert(d3.mouse(this)[0]);
        let index = bisect(data, mouseDate); // 返回当前这个数据项的索引

        // div.html(that.options.tooltip(that.data[parseInt(index)].symbolPosition));
        // div.style('left', d3.event.pageX + 'px');
        // div.style('top', (d3.event.pageY - 10) + 'px');

        // crosshair.select('#crossLineX').attr('x1')
        let d0 = data[index - 1];
        let d1 = data[index];
        let d;
        if (!d0) {
          d = d0;
        } else {
          d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
        }

        let x = scaleX(d.date);
        let y = scaleY(d.urRatio);

        div.html(tooltip(d));
        div.style('left', `${d3.event.pageX + 10}px`);
        div.style('top', `${d3.event.pageY - 10}px`);

        crosshair.select('#crossLineX')
          .attr('x1', x).attr('y1', scaleY(domainY[0]))
          .attr('x2', x).attr('y2', scaleY(domainY[1]));

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
    const leftAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis');
    const leftAxis = d3.axisLeft(this.scaleY).tickSize(0).tickPadding(4);

    leftAxisGroup.call(leftAxis);
  }

  renderBottomAxis() {
    const bottomAxisGroup = this.chartGroup.append('g').attr('class', 'chart-axis');
    const bottomAxis = d3.axisBottom(this.scaleX).tickSize(0).tickPadding(4);

    bottomAxisGroup.call(bottomAxis.tickFormat(d3.timeFormat("%H:%M"))).attr('transform', `translate(0, ${this.chartHeight})`);
    bottomAxisGroup.selectAll("text").attr('text-anchor', 'end');
  }

  initScale() {
    let domainX = d3.extent(this.data, d => d.date);
    let domainY = d3.extent(this.data, d => d.urRatio);
    let scaleX = d3.scaleTime().domain(domainX).range([0, this.chartWidth]);
    let scaleY = d3.scaleLinear().domain(domainY).range([this.chartHeight, 0]);

    this.domainX = domainX;
    this.domainY = domainY;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  renderChart() {
    let lineChartGroup = this.chartGroup.append('g');
    let { scaleX, scaleY } = this;
    let lineFn = d3.line()
      .x((d) => scaleX(d.date))
      .y((d) => scaleY(d.urRatio));

    let lineSelection = lineChartGroup.selectAll('.ratio-line').data([this.data]);

    lineSelection.enter()
      .append('path')
      .attr('class', 'ratio-line')
      .attr('d', lineFn)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', this.options.lineColor);
  }
}

huiceData.forEach(item => item.date = new Date(item.date));

let chart = new LineChart(document.getElementById('target'), {
  data: huiceData,
  tooltip: function (dataItem) {
    return `<code>${JSON.stringify(dataItem)}</code>`
  }
})

export default LineChart;