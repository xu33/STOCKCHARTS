/**
 * K线类
 * StockChart
 */
const d3 = require('d3');

import { WIN_COLOR, LOSS_COLOR, EQUAL_COLOR } from './libs/config';
import './css/stock-chart.css';
import Crosshair from './Crosshair';
import Axises from './Axises';

class StockChart {
  isFetching = false;
  loadingThrottleTimer = null;
  maTypes = ['ma5', 'ma10', 'ma20', 'ma30'];
  maLineInited = false;

  static defaultOptions = {
    VOLUME_PERCENT: 0.15,
    BRUSH_PERCENT: 0.1,
    margin: {
      left: 50,
      bottom: 20,
      right: 20,
      top: 0
    }
  };

  constructor(selector, options) {
    this.selector = selector;
    this.options = options;
    this.element = d3.select(selector);

    this.svg = this.element
      .append('svg')
      .attr('width', options.width)
      .attr('height', options.height);

    this.brushAreaHeight =
      options.height * StockChart.defaultOptions.BRUSH_PERCENT;

    this.volumeAreaHeight =
      options.height * StockChart.defaultOptions.VOLUME_PERCENT;

    this.totalHeight = this.options.height;

    this.candleStickAreaHeight =
      options.height - StockChart.defaultOptions.margin.bottom;

    this.candleStickAreaHeight -=
      this.brushAreaHeight + StockChart.defaultOptions.margin.bottom;

    if (this.options.volume) {
      this.candleStickAreaHeight -=
        this.volumeAreaHeight + StockChart.defaultOptions.margin.bottom;
    }

    this.options.candleData = this.options.candleData.map(str2number);

    this.initialBrushSelection = [
      this.options.width -
        StockChart.defaultOptions.margin.left -
        StockChart.defaultOptions.margin.right -
        300,
      this.options.width -
        StockChart.defaultOptions.margin.left -
        StockChart.defaultOptions.margin.right
    ];

    this.currentBrushSelection = this.initialBrushSelection;

    // 初始化比例尺
    this.initScales();
    // 初始化数轴
    this.initAxises();
    // 初次绘制
    this.render();
    // 初始化十字线交互
    this.initCrosshair();
  }

  initAxises() {
    const { margin } = StockChart.defaultOptions;

    this.axises = new Axises(this.svg, this.scaleX, this.scaleY, {
      x: margin.left,
      y: this.candleStickAreaHeight,
      width: this.options.width - margin.left - margin.right
    });
  }

  initCrosshair() {
    let that = this;
    let width =
      that.options.width -
      StockChart.defaultOptions.margin.left -
      StockChart.defaultOptions.margin.right;
    // let height =
    //   that.options.height -
    //   that.brushAreaHeight -
    //   StockChart.defaultOptions.margin.bottom * 2;

    let height = this.candleStickAreaHeight;

    this.crosshair = new Crosshair(
      this.svg,
      width,
      height,
      `translate(${StockChart.defaultOptions.margin.left}, ${StockChart
        .defaultOptions.margin.top})`
    );

    this.crosshair.onMove(function() {
      // console.log(d3.mouse(this));

      let scaleX = that.scaleBandX;
      let scaleY = that.scaleY;
      let currentCandleData = that.currentCandleData;
      let mouseX = d3.mouse(this)[0];
      let eachBand = scaleX.step();
      let mouseIndex = Math.round(mouseX / eachBand);

      let index = Math.round(mouseIndex);
      if (index < 0) index = 0;
      if (index > currentCandleData.length - 1)
        index = currentCandleData.length - 1;

      let d = currentCandleData[index];

      let x = scaleX(index) + scaleX.bandwidth() / 2;
      let y = scaleY(d.close);

      that.crosshair.setCurrentDataItem(d);

      return [
        {
          x1: 0,
          y1: y,
          x2: width,
          y2: y
        },
        {
          x1: x,
          y1: 0,
          x2: x,
          y2: height
        }
      ];
    });
  }

  initScales() {
    let { width } = this.options;
    let rangeX = [
      0,
      width -
        StockChart.defaultOptions.margin.left -
        StockChart.defaultOptions.margin.right
    ];

    this.scaleBandX = d3
      .scaleBand()
      .range(rangeX)
      // .paddingOuter(0)
      .padding(0.2);

    this.scaleX = d3.scaleTime().range(rangeX);
    this.scaleY = d3.scaleLinear().range([this.candleStickAreaHeight, 0]);
  }

  renderBrushArea() {
    let brushGroup = this.svg.append('g').attr('class', 'chart-brush');
    let translateY =
      this.candleStickAreaHeight + StockChart.defaultOptions.margin.bottom;

    if (this.options.volume) {
      translateY +=
        this.volumeAreaHeight + StockChart.defaultOptions.margin.bottom;
    }

    brushGroup.attr(
      'transform',
      `translate(${StockChart.defaultOptions.margin.left}, ${translateY})`
    );
    this.brushGroup = brushGroup;

    this.initBrushBehavior();
  }

  initBrushBehavior() {
    let { width } = this.options;
    let brush = d3.brushX();
    let self = this;

    brush.extent([
      [0, 0],
      [
        width -
          StockChart.defaultOptions.margin.left -
          StockChart.defaultOptions.margin.right,
        this.brushAreaHeight
      ]
    ]);

    brush.on('brush', brushed);
    this.brushGroup.call(brush).call(brush.move, this.initialBrushSelection);

    this.brushGroup
      .selectAll('.overlay')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0.2);

    function brushed(d, i) {
      // 下面两种写法作用相同
      // console.log(d3.brushSelection(this))
      // console.log('selection:', d3.event.selection)

      // if (self.isFetching) return;
      if (!d3.event.sourceEvent) return;

      let brushSelection = d3.event.selection;

      self.currentBrushSelection = brushSelection;

      // 重绘蜡烛线
      self.renderCandleSticks();

      // 重绘数轴;
      // self.updateAxis();
    }
  }

  calculateMinAndMax(candleData) {
    return {
      min: d3.min(candleData, d =>
        Math.min(d.low, d.ma5, d.ma10, d.ma20, d.ma30)
      ),
      max: d3.max(candleData, d =>
        Math.max(d.high, d.ma5, d.ma10, d.ma20, d.ma30)
      )
    };
  }

  getCurrentCandleData(callback) {
    let width = this.options.width;
    let candleData = this.options.candleData;
    let brushSelection = this.currentBrushSelection;

    let lastIndex = candleData.length - 1;
    // 索引比例尺
    let indexScale = d3
      .scaleLinear()
      .domain([0, lastIndex])
      .range([
        0,
        width -
          StockChart.defaultOptions.margin.left -
          StockChart.defaultOptions.margin.right
      ]);

    let domain = brushSelection.map(value => indexScale.invert(value));
    let [startIndex, endIndex] = domain;

    if (startIndex < 0 || endIndex > lastIndex) {
      throw new Error('索引溢出');
    }

    startIndex = Math.round(startIndex);
    endIndex = Math.round(endIndex) + 1;

    console.log(`当前数据范围:${startIndex} - ${endIndex}`);

    let currentCandleData = candleData.slice(startIndex, endIndex);
    let emptySlots = [];

    for (let i = 0; i < currentCandleData.length; i++) {
      if (!currentCandleData[i]) {
        emptySlots.push(currentCandleData[i]);
      } else {
        break;
      }
    }

    if (emptySlots.length == 0) {
      this.isFetching = false;
      callback(currentCandleData);
    } else {
      this.isFetching = true;

      if (this.loadingThrottleTimer) {
        clearTimeout(this.loadingThrottleTimer);
      }

      this.loadingThrottleTimer = setTimeout(() => {
        this.options.loadingPreviousData(emptySlots.length).then(candleData => {
          this.options.candleData = candleData;
          this.loadingThrottleTimer = null;
          this.getCurrentCandleData(callback);
        });
      }, 500);
    }
  }

  // 蜡烛线
  renderCandleSticks() {
    if (!this.candleGroup) {
      this.candleGroup = this.svg.append('g').attr('class', 'candle-sticks');
      this.candleGroup.attr(
        'transform',
        `translate(${StockChart.defaultOptions.margin.left}, 0)`
      );
    }

    this.getCurrentCandleData(candleData => {
      let { svg } = this;

      let { min, max } = this.calculateMinAndMax(candleData);
      let { scaleBandX, scaleX, scaleY } = this;

      scaleBandX.domain(candleData.map((o, i) => i));
      scaleY.domain([min, max]);
      scaleX.domain(d3.extent(candleData, d => new Date(d.time)));

      // 渲染数轴
      this.axises.render();

      let selection = this.candleGroup
        .selectAll('.bar')
        .data(candleData, d => d.time);

      selection.exit().remove();

      selection
        .enter()
        .append('rect')
        .merge(selection)
        .attr('class', 'bar')
        .attr('x', (d, i) => scaleBandX(i))
        .attr('y', d => scaleY(Math.max(d.open, d.close)))
        .attr('width', scaleBandX.bandwidth())
        .attr('height', function(d) {
          return Math.round(Math.abs(scaleY(d.open) - scaleY(d.close)));
        })
        .attr('fill', calColor);

      this.renderWicks(candleData, this.candleGroup, scaleBandX, scaleY);
      this.renderMovingAverage(candleData, this.candleGroup, scaleY);

      // 重绘量线
      this.volumes(candleData);

      // 保存当前的数据集
      this.currentCandleData = candleData;
    });
  }

  renderWicks(candleData, group, scaleX, scaleY) {
    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    let wicks = group.selectAll('.shadow').data(candleData);

    wicks.exit().remove();

    wicks
      .enter()
      .append('path')
      .merge(wicks)
      .attr('class', 'shadow')
      .attr('d', (d, i) => {
        var x = scaleX(i) + scaleX.bandwidth() / 2;
        var y1 = scaleY(d.high);
        var y2 = scaleY(d.low);

        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
      })
      .attr('stroke', calColor);
  }

  renderMovingAverage(candleData, group, scaleY) {
    let { width } = this.options;
    let scaleX = d3
      .scaleLinear()
      .domain([0, candleData.length - 1])
      .range([
        0,
        width -
          StockChart.defaultOptions.margin.left -
          StockChart.defaultOptions.margin.right
      ]);

    let lineGenFn = key =>
      d3
        .line()
        .x((d, i) => scaleX(i))
        .y(d => scaleY(d[key]));

    let mas = this.maTypes;

    if (!this.maLineInited) {
      mas.forEach(prop => {
        group.append('path').attr('class', prop);
      });
      this.maLineInited = true;
    }

    mas.forEach(function(prop) {
      group
        .select(`.${prop}`)
        .datum(candleData)
        .attr('d', lineGenFn(prop));
    });
  }

  volumes(candleData) {
    let { width } = this.options;

    if (!this.volumeGroup) {
      let translateY =
        this.candleStickAreaHeight + StockChart.defaultOptions.margin.bottom;

      this.volumeGroup = this.svg
        .append('g')
        .attr('class', 'volume-group')
        .attr(
          'transform',
          `translate(
            ${StockChart.defaultOptions.margin.left}, 
            ${translateY}
          )`
        );

      this.volumeGroup
        .append('rect')
        .attr('class', 'volume-bg')
        .attr(
          'width',
          this.options.width -
            StockChart.defaultOptions.margin.left -
            StockChart.defaultOptions.margin.right
        )
        .attr('height', this.volumeAreaHeight)
        .attr('x', 0)
        .attr('y', 0);

      this.volumeScaleY = d3.scaleLinear().range([this.volumeAreaHeight, 0]);
    }

    let volumeDomain = d3.extent(candleData, d => d.volume);
    this.volumeScaleY.domain(volumeDomain);

    let selection = this.volumeGroup.selectAll('.bar').data(candleData);
    selection.exit().remove();

    selection
      .enter()
      .append('rect')
      .merge(selection)
      .attr('class', 'bar')
      .attr('x', (d, i) => this.scaleBandX(i))
      .attr('y', d => this.volumeScaleY(d.volume))
      .attr('width', this.scaleBandX.bandwidth())
      .attr('height', d => this.volumeAreaHeight - this.volumeScaleY(d.volume))
      .attr('fill', calColor);
  }

  render() {
    this.renderCandleSticks();
    this.renderBrushArea();
  }
}

function str2number(stock) {
  var keys = ['low', 'high', 'open', 'close'];

  keys.forEach(function(key) {
    stock[key] = +stock[key];
  });

  return stock;
}

function calColor(d) {
  if (d.close > d.open) {
    return WIN_COLOR;
  } else if (d.close < d.open) {
    return LOSS_COLOR;
  } else {
    return EQUAL_COLOR;
  }
}

export default StockChart;
