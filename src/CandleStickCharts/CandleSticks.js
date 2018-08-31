import * as d3 from 'd3';
import colors from './colors';
import Crosshair from './Crosshair';
import Indicator from '../shares/Indicator';
import { linspace } from '../utils/linspace';
import thunkArray from '../utils/chunkarray';

class CandleSticks {
  static margin = {
    left: 40,
    right: 40,
    top: 20,
    bottom: 20
  };

  static x_tick_num = 3;
  static y_tick_num = 3;
  static offset_ratio = 0.05;

  constructor(parentNode, { x, y, width, height, type, parent }) {
    const { left, right, top, bottom } = CandleSticks.margin;

    this.parent = parent;
    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom,
      type: type
    };

    let translateX = x + left;
    let translateY = y + top;

    this.element = parentNode.append('g');
    this.element.attr('transform', `translate(${translateX}, ${translateY})`);

    this.init();
  }

  init() {
    this.initGroups(); // 图形组
    this.initAxis(); // 数轴组
    this.initScales(); // 比例尺
    this.initCrosshair(); // 十字线
    this.initIndicators(); // 指示器
  }

  updateAxis() {
    var { width, height } = this.options;

    this.element
      .select('.right_axis')
      .attr('transform', `translate(${width}, 0)`);
    this.element
      .select('.bottom_axis')
      .attr('transform', `translate(0, ${height})`);

    this.element.select('.grid_y').attr('transform', `translate(0, ${height})`);
  }

  updateScales() {
    let { left, right, bottom, top } = CandleSticks.margin;
    let { width, height } = this.options;
    this.range_x = [0, width];
    this.range_y = [height, 0];

    this.scaleBand.range(this.range_x);
    this.scalePrice.range(this.range_y);
    this.scaleIndex.range([0, this.options.width]);
  }

  resize(boundingBox) {
    var { left, right, top, bottom } = CandleSticks.margin;
    var { x, y, width, height } = boundingBox;

    this.options = Object.assign(this.options, {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom
    });

    var tx = x + left;
    var ty = y + top;

    this.element.attr('transform', `translate(${tx}, ${ty})`);
    // 更新比例尺和数轴容器
    this.updateScales();
    this.updateAxis();
    this.updateCrosshair();
    this.render(this.data);
  }

  updateCrosshair() {
    this.crosshair.resize({
      x: 0,
      y: 0,
      width: this.options.width,
      height: this.options.height
    });
  }

  extent() {
    let data = this.data;

    // let min = d3.min(data, d => d.low);
    // let max = d3.max(data, d => d.high);

    // 如果画均线 需要把均线的价格计算在内
    var min = d3.min(data, function(d) {
      var vals = [d.low, d.ma5, d.ma10, d.ma20, d.ma60].filter(Boolean);
      return Math.min.apply(Math, vals);
    });

    var max = d3.max(data, function(d) {
      var vals = [d.high, d.ma5, d.ma10, d.ma20, d.ma60].filter(Boolean);
      return Math.max.apply(Math, vals);
    });

    // console.log(min, max);

    max = max * (1 + CandleSticks.offset_ratio);
    min = min - max * CandleSticks.offset_ratio;

    // if (min < 0) min = 0;

    // return [
    //   min * (1 - CandleSticks.offset_ratio),
    //   max * (1 + CandleSticks.offset_ratio)
    // ];

    return [min, max];
  }

  // 初始化文字指示器
  initIndicators() {
    // 价格指示器
    this.priceIndicator = new Indicator(this.crosshair);
    // 时间指示器
    this.timeIndicator = new Indicator(this.crosshair);
  }

  initCrosshair() {
    let { width, height } = this.options;
    this.crosshair = new Crosshair(this.element, {
      x: 0,
      y: 0,
      width,
      height
    });

    this.crosshair.on('move', this.handleMouseMove.bind(this));
  }

  handleMouseMove(mousePosition) {
    let data = this.data;
    let len = data.length;
    let scale_x = this.scaleBand;
    let scale_y = this.scalePrice;
    let mouse_x = mousePosition[0];
    let each_band_width = scale_x.step();
    let index = Math.round(mouse_x / each_band_width);
    if (index < 0) index = 0;
    if (index > len - 1) index = len - 1;
    let item = data[index];

    let x = scale_x(index) + scale_x.bandwidth() / 2;
    let y = scale_y(item.close);

    // 更新十字线坐标
    this.crosshair.setHorizontalCrosslinePosition(y);
    this.crosshair.setVerticalCrosslinePosition(x);

    // 更新指示器内容和位置
    this.updateTimeIndicator(x, item);
    this.updatePriceIndicator(y, item);

    this.currentMousePosition = mousePosition;
  }

  handleZoomStart() {
    // 缩放行为时 如果十字线已经初始化过 隐藏十字辅助线的显示
    if (this.crosshair && this.currentMousePosition) {
      this.crosshair.hide();
    }
  }

  handleZoomEnd() {
    // 缩放行为结束后 恢复十字辅助线的显示
    // 并使用上次保存的鼠标位置 对十字线进行重新定位
    if (this.crosshair && this.currentMousePosition) {
      this.handleMouseMove(this.currentMousePosition);
      this.crosshair.show();
    }
  }

  // 渲染时间指示器
  updateTimeIndicator(x, currentDataItem) {
    let y = this.options.height;

    this.timeIndicator.setText(
      d3.timeFormat('%Y-%m-%d')(new Date(currentDataItem.timestamp))
    );

    this.timeIndicator.setPosition(x, y, 'vertical');
  }

  // 渲染价格指示器
  updatePriceIndicator(y, currentDataItem) {
    let x = 0;
    let price = d3.format('.2f')(currentDataItem.close);

    this.priceIndicator.setText(price);
    this.priceIndicator.setPosition(x, y, 'horizontal', 'left');
  }

  initGroups() {
    // 蜡烛图组
    this.element.append('g').attr('class', 'candle_sticks');
    // 最高，最低组
    this.element.append('g').attr('class', 'min_and_max');
  }

  initScales() {
    let { left, right, bottom, top } = CandleSticks.margin;
    let { width, height } = this.options;

    // 公用的横轴range
    let range_x = (this.range_x = [0, width]);
    // 蜡烛图比例尺
    this.scaleBand = d3
      .scaleBand()
      .range(range_x)
      .padding(0.2);

    let range_y = [height, 0];
    // 纵向价格比例尺
    this.scalePrice = d3.scaleLinear().range(range_y);
    // 均线比例尺
    this.scaleIndex = d3.scaleLinear().range([0, this.options.width]);
  }

  initAxis() {
    let { width, height } = this.options;
    // 左y轴
    this.element.append('g').attr('class', 'axis left_axis');

    // 右y轴
    this.element
      .append('g')
      .attr('class', 'axis right_axis')
      .attr('transform', `translate(${width}, ${0})`);

    // 底x轴
    this.element
      .append('g')
      .attr('class', 'axis bottom_axis')
      .attr('transform', `translate(0, ${height})`);

    // 水平辅助线
    var gridx = this.element.select('.grid_x');
    if (gridx.empty()) {
      gridx = this.element.append('g').attr('class', 'axis grid_x');
    }

    // 垂直辅助线
    var gridy = this.element.select('.grid_y');
    if (gridy.empty()) {
      gridy = this.element.append('g').attr('class', 'axis grid_y');
    }
    gridy.attr('transform', `translate(0, ${height})`);

    // 边框
    // this.element
    //   .append('rect')
    //   .attr('class', 'axis_border')
    //   .attr('x', 0)
    //   .attr('y', 1)
    //   .attr('width', width)
    //   .attr('height', height);
  }

  render(data) {
    if (data.length < 1) {
      return;
    }
    this.data = data;
    this.renderCandleSticks();
    this.renderWicks();
    this.renderAxis();
    this.renderMaLines();
  }

  renderCandleSticks() {
    let { scaleBand, scalePrice } = this;
    let group = this.element.select('.candle_sticks');
    let data = this.data;

    let domain_price = this.extent();
    let domain_x = data.map((o, i) => i);

    scaleBand.domain(domain_x);
    scalePrice.domain(domain_price);

    let selection = group.selectAll('.bar').data(data, d => d.timestamp);

    let bandwidth = scaleBand.bandwidth();

    if (bandwidth <= 2) {
      selection.remove();
      return;
    }

    let exit = selection.exit();
    let enter = selection.enter().append('rect');

    selection
      .merge(enter)
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleBand(i))
      .attr('y', ({ open, close }) => scalePrice(Math.max(open, close)))
      .attr('width', scaleBand.bandwidth())
      .attr('height', ({ open, close }) =>
        Math.round(Math.abs(scalePrice(open) - scalePrice(close)))
      )
      .attr('fill', calColor);

    exit.remove();
  }

  renderWicks() {
    let group = this.element.select('.candle_sticks');
    let { scaleBand, scalePrice, data } = this;
    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    let maxPrice = data[0].high;
    let minPrice = data[0].low;
    let maxOneX;
    let maxOneY;
    let minOneX;
    let minOneY;

    let wicks = group.selectAll('.shadow').data(data);

    wicks.exit().remove();

    wicks
      .enter()
      .append('path')
      .merge(wicks)
      .attr('class', 'shadow')
      .attr('d', (d, i) => {
        var x = scaleBand(i) + scaleBand.bandwidth() / 2;
        var y1 = scalePrice(d.high);
        var y2 = scalePrice(d.low);

        if (d.high >= maxPrice) {
          maxPrice = d.high;
          maxOneX = x;
          maxOneY = y1;
        }

        if (d.low <= minPrice) {
          minPrice = d.low;
          minOneX = x;
          minOneY = y2;
        }

        // console.log('high:', d.high);

        return line([{ x, y: y1 }, { x, y: y2 }]);
      })
      .attr('stroke', calColor);

    this.renderMaxAndMin(
      maxOneX,
      maxOneY,
      minOneX,
      minOneY,
      maxPrice,
      minPrice
    );
  }

  // 绘制日均线
  renderMaLines() {
    this.renderMaBy(5);
    this.renderMaBy(10);
    this.renderMaBy(20);
    this.renderMaBy(60);
  }

  renderMaBy(days) {
    if (typeof days !== 'number') {
      throw '均线日期必须为数字';
    }

    this.scaleIndex.domain([0, this.data.length - 1]);

    var scaleIndex = this.scaleIndex;
    var scalePrice = this.scalePrice;
    var key = 'ma' + days;
    var line = d3
      .line()
      .x(function(d, i) {
        return scaleIndex(i);
      })
      .y(function(d, i) {
        return scalePrice(d[key]);
      })
      .defined(function(d) {
        return d.hasOwnProperty(key);
      });

    var path = this.element.select(`.${key}`);
    if (path.empty()) {
      path = this.element.append('path').attr('class', key);
    }

    path.attr('d', line(this.data));
  }

  // 纵坐标轴使用序数比例尺
  calculateLeftAndRightAxisScale() {
    // let lengthNeed = 4;
    // let { left, right, bottom, top } = CandleSticks.margin;
    // let { width, height } = this.options;
    // let extent = this.extent();
    // let domain = linspace(extent[1], extent[0], lengthNeed);
    // let range = linspace(0, height, lengthNeed);

    // this.leftAndRightAxisScale = d3
    //   .scaleOrdinal()
    //   .domain(domain)
    //   .range(range);

    var ticks = 6;
    var extent = this.extent();
    var height = this.options.height;
    var interpolator = d3.interpolateNumber(extent[1], extent[0]);
    var interpolatorR = d3.interpolateNumber(0, height);
    var domain = [];
    var range = [];
    var step = 1 / ticks;
    for (var i = 0; i <= ticks; i++) {
      domain.push(interpolator(step * i).toFixed(2));
      range.push(interpolatorR(step * i).toFixed(2));
    }

    this.leftAndRightAxisScale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);
  }

  // 纵坐标轴使用线性比例尺
  _calculateLeftAndRightAxisScale() {
    let { height } = this.options;
    let extent = this.extent();
    let domain = [extent[1], extent[0]];
    let range = [0, height];

    this.leftAndRightAxisScale = d3
      .scaleLinear()
      .domain(domain)
      .range(range);
  }

  renderAxis() {
    // 计算左右两个轴的序数比例尺
    this.calculateLeftAndRightAxisScale();
    // 渲染左侧数轴
    this.renderLeftAxis();
    // 渲染右侧数轴
    this.renderRightAxis();
    // 渲染底部数轴
    this.renderBottomAxis();
  }

  renderLeftAxis() {
    let formatter = d3.format('.2f');

    if (this.leftAxis === undefined) {
      this.leftAxis = d3
        .axisLeft(this.leftAndRightAxisScale.copy())
        .tickSize(0)
        .tickPadding(5)
        .tickFormat(formatter);
    }

    this.leftAxis.scale(this.leftAndRightAxisScale.copy());

    this.element.select('.left_axis').call(this.leftAxis);

    // 微调文字的位置
    // this.element
    //   .select('.left_axis')
    //   .selectAll('.tick text')
    //   .attr('transform', (d, i) => {
    //     if (i === 0) {
    //       return `translate(0, 10)`;
    //     } else {
    //       return `translate(0, -10)`;
    //     }
    //   });

    this.renderHorizontalGridLines();
  }

  renderHorizontalGridLines() {
    let axis = d3
      .axisLeft(this.leftAndRightAxisScale.copy())
      .tickSize(-this.options.width)
      .tickFormat('');

    this.element.select('.grid_x').call(axis);
  }

  renderRightAxis() {
    // console.log('renderRightAxis fired');
    let formatter = d3.format('.2f');

    if (this.rightAxis === undefined) {
      this.rightAxis = d3
        .axisRight(this.leftAndRightAxisScale.copy())
        .tickSize(0)
        .tickPadding(5)
        .tickFormat(formatter);
    }

    this.rightAxis.scale(this.leftAndRightAxisScale.copy());
    this.element.select('.right_axis').call(this.rightAxis);

    // 微调文字的位置
    // this.element
    //   .select('.right_axis')
    //   .selectAll('.tick text')
    //   .attr('transform', (d, i) => {
    //     if (i === 0) {
    //       return `translate(0, 10)`;
    //     } else {
    //       return `translate(0, -10)`;
    //     }
    //   });
  }

  getBottomAxisTickFormatter() {
    let type = this.options.type;
    switch (type) {
      case '1':
      case '5':
        return d3.timeFormat('%M:%S');
      case '15':
      case '30':
      case '60':
        return d3.timeFormat('%m-%d');
      case 'D':
      case 'W':
      case 'M':
      case 'Y':
      default:
        return d3.timeFormat('%Y-%m-%d');
    }
  }

  // 使用线性比例尺
  renderBottomAxis() {
    let { width, height } = this.options;
    let domain = [
      this.data[0].timestamp,
      this.data[this.data.length - 1].timestamp
    ];
    let range = [0, width];

    let scale = d3
      .scaleLinear()
      .domain(domain)
      .range(range);

    let formatter = this.getBottomAxisTickFormatter();
    let bottomAxis = d3
      .axisBottom(scale)
      .ticks(3)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(formatter);

    this.element.select('.bottom_axis').call(bottomAxis);
    this.element.select('.grid_y').call(
      d3
        .axisBottom(scale)
        .tickSize(-height)
        .tickFormat('')
    );
  }

  renderVerticalGridLines(scale) {
    let axis = d3
      .axisBottom(scale)
      .tickSize(-this.options.height)
      .tickFormat('');

    this.element.select('.grid_y').call(axis);
  }

  renderMaxAndMin(maxOneX, maxOneY, minOneX, minOneY, maxPrice, minPrice) {
    let { width } = this.options;
    let group = this.element.select('.min_and_max');
    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    if (group.select('.min_path').empty()) {
      group.append('path').attr('class', 'min_path');
      group.append('rect').attr('class', 'min_wrap indicator-box');
      group
        .append('text')
        .attr('class', 'min_price')
        .style('font-size', '10px');
    }

    if (group.select('.max_path').empty()) {
      group.append('path').attr('class', 'max_path');
      group.append('rect').attr('class', 'max_wrap indicator-box');
      group
        .append('text')
        .attr('class', 'max_price')
        .style('font-size', '10px');
    }

    var maxOneX2, minOneX2;
    var maxTextX, minTextX;

    if (maxOneX > 0 && maxOneX < width - 50) {
      maxOneX2 = maxOneX + 10;
      maxTextX = maxOneX2;
    } else {
      maxOneX2 = maxOneX - 10;
      maxTextX = maxOneX2 - 20;
    }

    if (minOneX > 0 && minOneX < width - 50) {
      minOneX2 = minOneX + 10;
      minTextX = minOneX2;
    } else {
      minOneX2 = minOneX - 10;
      minTextX = minOneX2 - 20;
    }

    group
      .select('.max_path')
      .attr('d', () => {
        return line([
          {
            x: maxOneX,
            y: maxOneY
          },
          {
            x: maxOneX2,
            y: maxOneY
          }
        ]);
      })
      .attr('stroke', '#ccc');

    group
      .select('.min_path')
      .attr('d', () => {
        return line([
          {
            x: minOneX,
            y: minOneY
          },
          {
            x: minOneX2,
            y: minOneY
          }
        ]);
      })
      .attr('stroke', '#ccc');

    // console.log(maxPrice, minPrice);

    this.renderMaxText(group, maxTextX, maxOneY, maxPrice);
    this.renderMinText(group, minTextX, minOneY + 10, minPrice);
  }

  renderMinText(group, x, y, text) {
    let element = group.select('.min_price');

    element
      .attr('x', x)
      .attr('y', y)
      .text(d3.format('.2f')(text));

    let boundingBox = element.node().getBBox();
    let attrs = ['width', 'height', 'x', 'y'];
    let rect = group.select('.min_wrap');
    // attrs.forEach(attr => {
    //   rect.attr(attr, boundingBox[attr]);
    // });
    rect
      .attr('x', boundingBox.x - 2)
      .attr('y', boundingBox.y)
      .attr('width', boundingBox.width + 4)
      .attr('height', boundingBox.height);
  }

  renderMaxText(group, x, y, text) {
    let element = group.select('.max_price');

    element
      .attr('x', x)
      .attr('y', y)
      .text(d3.format('.2f')(text));

    let boundingBox = element.node().getBBox();
    // let attrs = ['width', 'height', 'x', 'y'];
    let rect = group.select('.max_wrap');
    // attrs.forEach(attr => {
    //   rect.attr(attr, boundingBox[attr]);
    // });

    rect
      .attr('x', boundingBox.x - 2)
      .attr('y', boundingBox.y)
      .attr('width', boundingBox.width + 4)
      .attr('height', boundingBox.height);
  }
}

function calColor(d) {
  if (d.close > d.open) {
    return colors.WIN_COLOR;
  } else if (d.close < d.open) {
    return colors.LOSS_COLOR;
  } else {
    return colors.EQUAL_COLOR;
  }
}

export default CandleSticks;
