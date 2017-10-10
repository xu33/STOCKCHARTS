import * as d3 from 'd3';
import colors from './colors';
import Crosshair from './Crosshair';
import Indicator from './Indicator';
import { linspace } from '../utils/linspace';
import thunkArray from '../utils/chunkarray';

class CandleSticks {
  static margin = {
    left: 10,
    right: 3,
    top: 20,
    bottom: 20
  };

  static x_tick_num = 3;
  static y_tick_num = 3;
  static offset_ratio = 0.2;

  constructor(parentNode, { x, y, width, height, type }) {
    const { left, right, top, bottom } = CandleSticks.margin;

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
    this.initCrosshair(); // 辅助线
    this.initIndicators(); // 指示器
    // this.initText(); // 顶部文字
  }

  // 顶部文字
  initText() {
    let { top, left, right, bottom } = CandleSticks.margin;
    let { width, height } = this.options;

    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    let data = [
      {
        x: 0,
        y: top
      },
      {
        x: 0,
        y: 1
      },
      {
        x: width,
        y: 1
      },
      {
        x: width,
        y: top
      }
    ];

    this.element
      .append('text')
      .attr('class', 'tip_text')
      .attr('x', 8)
      .attr('y', 15);

    this.element
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('class', 'text_box')
      .attr('fill', 'none')
      .attr('stroke', '#ccc');
  }

  extent() {
    let data = this.data;
    // 如果画均线 需要把均线的价格计算在内
    // let min = d3.min(data, d =>
    //   Math.min(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
    // );
    // let max = d3.max(data, d =>
    //   Math.max(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
    // );

    let min = d3.min(data, d => d.low);
    let max = d3.max(data, d => d.high);

    max = max * (1 + CandleSticks.offset_ratio);
    min = min - max * CandleSticks.offset_ratio;

    if (min < 0) min = 0;

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

    this.crosshair.on('move', mousePosition => {
      let data = this.data;
      let l = data.length;
      let scale_x = this.scale_band;
      let scale_y = this.scale_price;
      let mouse_x = mousePosition[0];
      let each_band_width = scale_x.step();
      let index = Math.round(mouse_x / each_band_width);
      if (index < 0) index = 0;
      if (index > l - 1) index = l - 1;
      let item = data[index];

      let x = scale_x(index) + scale_x.bandwidth() / 2;
      let y = scale_y(item.close);

      // 更新十字线坐标
      this.crosshair.setHorizontalCrosslinePosition(y);
      this.crosshair.setVerticalCrosslinePosition(x);

      // 更新指示器内容和位置
      this.updateTimeIndicator(x, item);
      this.updatePriceIndicator(y, item);
    });
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
    this.priceIndicator.setPosition(x, y, 'horizontal');
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
    this.scale_band = d3
      .scaleBand()
      .range(range_x)
      .padding(0.2);

    let range_y = [height, 0];
    // 纵向价格比例尺
    this.scale_price = d3.scaleLinear().range(range_y);
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
    this.element.append('g').attr('class', 'axis grid_x');

    // 垂直辅助线
    this.element
      .append('g')
      .attr('class', 'axis grid_y')
      .attr('transform', `translate(0, ${height})`);

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
    this.data = data;
    if (!this.data || this.data.length < 1) return;
    this.renderCandleSticks();
    this.renderWicks();
    this.renderAxis();
  }

  renderCandleSticks() {
    let { scale_band, scale_price } = this;
    let group = this.element.select('.candle_sticks');
    let data = this.data;

    let domain_price = this.extent();
    let domain_x = data.map((o, i) => i);

    scale_band.domain(domain_x);
    scale_price.domain(domain_price);

    let selection = group.selectAll('.bar').data(data, d => d.timestamp);

    selection.exit().remove();

    selection
      .enter()
      .append('rect')
      .merge(selection)
      .attr('class', 'bar')
      .attr('x', (d, i) => scale_band(i))
      .attr('y', ({ open, close }) => scale_price(Math.max(open, close)))
      .attr('width', scale_band.bandwidth())
      .attr('height', ({ open, close }) =>
        Math.round(Math.abs(scale_price(open) - scale_price(close)))
      )
      .attr('fill', calColor);
  }

  renderWicks() {
    let group = this.element.select('.candle_sticks');
    let { scale_band, scale_price, data } = this;
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
        var x = scale_band(i) + scale_band.bandwidth() / 2;
        var y1 = scale_price(d.high);
        var y2 = scale_price(d.low);

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

    // console.log(scale_price.domain());

    // console.log(maxOneX, maxOneY, minOneX, minOneY);
  }

  calculateLeftAndRightAxisScale() {
    const lengthNeed = 4;
    let { left, right, bottom, top } = CandleSticks.margin;
    let { width, height } = this.options;
    let domain = this.extent();

    domain = linspace(domain[1], domain[0], lengthNeed);
    let range = linspace(0, height, lengthNeed);

    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);

    this.leftAndRightAxisScale = scale;
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
        .axisRight(this.leftAndRightAxisScale.copy())
        .tickSize(0)
        .tickPadding(5)
        .tickFormat(formatter);
    }

    this.leftAxis.scale(this.leftAndRightAxisScale.copy());

    this.element.select('.left_axis').call(this.leftAxis);

    this.element
      .select('.left_axis')
      .selectAll('.tick text')
      .attr('transform', (d, i) => {
        if (i === 0) {
          return `translate(0, 10)`;
        } else {
          return `translate(0, -10)`;
        }
      });

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
        .axisLeft(this.leftAndRightAxisScale.copy())
        .tickSize(0)
        .tickPadding(5)
        .tickFormat(formatter);
    }

    this.rightAxis.scale(this.leftAndRightAxisScale.copy());
    this.element.select('.right_axis').call(this.rightAxis);

    this.element
      .select('.right_axis')
      .selectAll('.tick text')
      .attr('transform', (d, i) => {
        if (i === 0) {
          return `translate(0, 10)`;
        } else {
          return `translate(0, -10)`;
        }
      });
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
        return d3.timeFormat('%Y-%m-%d');
      default:
        return d3.timeFormat('%Y-%m-%d');
    }
  }

  renderBottomAxis() {
    let { left, right, bottom, top } = CandleSticks.margin;
    let { width, height } = this.options;
    let lengthNeed = 4;
    let chunks = thunkArray([...this.data], lengthNeed);
    let domain = chunks.map(chunk => new Date(chunk[0].timestamp));
    let range = linspace(0, width, lengthNeed + 1);

    if (domain.length > lengthNeed) domain.pop();

    domain.push(new Date());

    // console.log(domain, range);

    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);

    let formatter = this.getBottomAxisTickFormatter();

    let bottomAxis = d3
      .axisBottom(scale)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(formatter);

    let element = this.element.select('.bottom_axis');

    element.call(bottomAxis);
    element
      .selectAll('.tick text')
      .attr('text-anchor', 'start')
      .style('display', (d, i) => {
        if (i === range.length - 1) return 'none';
        else return null;
      });

    this.renderVerticalGridLines(scale);
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
      .attr('stroke', '#000');

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
      .attr('stroke', '#000');

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
