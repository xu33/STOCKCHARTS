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
  static offset_ratio = 0.01;

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
    this.initText(); // 顶部文字
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

    // let min = d3.min(data, d =>
    //   Math.min(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
    // );
    // let max = d3.max(data, d =>
    //   Math.max(d.low, d.high, d.ma5, d.ma10, d.ma20, d.ma30)
    // );

    let min = d3.min(data, d => d.low);
    let max = d3.max(data, d => d.high);

    return [
      min * (1 - CandleSticks.offset_ratio),
      max * (1 + CandleSticks.offset_ratio)
    ];
  }

  // 初始化文字指示器
  initIndicators() {
    // 价格指示器
    this.priceIndicator = new Indicator(this.crosshair.element);
    // 时间指示器
    this.timeIndicator = new Indicator(this.crosshair.element, 70);
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
      d3.timeFormat('%Y-%m-%d')(new Date(currentDataItem.time))
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
    // y轴
    this.element.append('g').attr('class', 'axis left_axis');
    // y轴
    this.element
      .append('g')
      .attr('class', 'axis right_axis')
      .attr('transform', `translate(${width}, ${0})`);

    // x轴
    this.element
      .append('g')
      .attr('class', 'axis bottom_axis')
      .attr('transform', `translate(0, ${height})`);

    // 辅助线
    this.element.append('g').attr('class', 'axis grid_x');

    // 辅助线
    this.element
      .append('g')
      .attr('class', 'axis grid_y')
      .attr('transform', `translate(0, ${height})`);

    // 边框
    this.element
      .append('rect')
      .attr('class', 'axis_border')
      .attr('x', 0)
      .attr('y', 1)
      .attr('width', width)
      .attr('height', height);
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

    let selection = group.selectAll('.bar').data(data, d => d.time);

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

        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
      })
      .attr('stroke', calColor);
  }

  renderAxis() {
    this.renderLeftAxis();
    this.renderRightAxis();
    this.renderBottomAxis();
  }

  renderLeftAxis() {
    let axis = d3
      .axisRight(this.scale_price)
      .ticks(CandleSticks.y_tick_num)
      .tickSize(0)
      .tickPadding(2)
      .tickFormat(d3.format('.2f'));

    this.element.select('.left_axis').call(axis);
    this.element
      .select('.left_axis')
      .selectAll('.tick text')
      .attr('transform', `translate(0, -8)`);

    this.render_grids_x();
  }

  renderRightAxis() {
    let axis = d3
      .axisLeft(this.scale_price)
      .ticks(CandleSticks.y_tick_num)
      .tickSize(0)
      .tickPadding(2)
      .tickFormat(d3.format('.2f'));

    this.element.select('.right_axis').call(axis);
    this.element
      .select('.right_axis')
      .selectAll('.tick text')
      .attr('transform', `translate(0, -8)`);
  }

  render_grids_x() {
    let axis = d3
      .axisLeft(this.scale_price)
      .ticks(CandleSticks.y_tick_num)
      .tickSize(-this.options.width)
      .tickFormat('');

    this.element.select('.grid_x').call(axis);
  }

  // _renderBottomAxis() {
  //   let scale = d3
  //     .scaleTime()
  //     .range(this.range_x)
  //     .domain(d3.extent(this.data, d => new Date(d.time)));

  //   let bottomAxis = d3
  //     .axisBottom(scale)
  //     .ticks(CandleSticks.x_tick_num)
  //     .tickSize(0)
  //     .tickPadding(8)
  //     .tickFormat(d3.timeFormat('%Y-%m-%d'));

  //   this.element.select('.bottom_axis').call(bottomAxis);

  //   this.render_grids_y(scale);
  // }

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
    let range = linspace(0, width - width / lengthNeed, lengthNeed);

    if (domain.length > lengthNeed) domain.pop();

    let scale = d3
      .scaleOrdinal()
      .domain(domain)
      .range(range);

    let formatter = this.getBottomAxisTickFormatter();

    let bottomAxis = d3
      .axisBottom(scale)
      .tickSize(0)
      .tickPadding(5)
      .tickFormat(formatter);

    this.element.select('.bottom_axis').call(bottomAxis);
    this.element
      .select('.bottom_axis')
      .selectAll('.tick text')
      .attr('text-anchor', 'start');

    this.render_grids_y(scale);
  }

  // _render_grids_y(scale) {
  //   let axis = d3
  //     .axisBottom(scale)
  //     .ticks(CandleSticks.x_tick_num)
  //     .tickSize(-this.options.height)
  //     .tickFormat('');

  //   this.element.select('.grid_y').call(axis);
  // }

  render_grids_y(scale) {
    let axis = d3
      .axisBottom(scale)
      .tickSize(-this.options.height)
      .tickFormat('');

    this.element.select('.grid_y').call(axis);
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
