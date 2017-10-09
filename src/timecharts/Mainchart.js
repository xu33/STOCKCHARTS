const OVERFLOW_RATIO = 1.2;
import { linspace } from '../utils/linspace';
import * as d3 from 'd3';
import Crosshair from './Crosshair';
import Indicator from './Indicator';

class Mainchart {
  static START_INDEX = 0;
  static END_INDEX = 241;

  static defaultOptions = {
    margin: {
      top: 20,
      left: 5,
      right: 0,
      bottom: 20
    }
  };

  constructor(parentNode, options) {
    let { x, y } = options;
    this.options = options;
    this.element = parentNode
      .append('g')
      .attr('transform', `translate(${x}, ${y})`);

    this.initialize();
  }

  initialize() {
    this.initText();
    this.initScales();
    this.initLines();
    this.initAxisGroups();
    this.initCrosshair();
    this.initIndicators();

    // 创建渐变色填充
    this.createGradientDef();
  }

  // 顶部文字
  initText() {
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height } = this.options;

    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    let data = [
      {
        x: left + 1,
        y: top
      },
      {
        x: left + 1,
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
      .attr('x', 8 + left)
      .attr('y', 15);

    this.element
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('class', 'text_box')
      .attr('fill', 'none')
      .attr('stroke', '#ccc');
  }

  // 初始化十字线交互
  initCrosshair() {
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height } = this.options;

    this.crosshair = new Crosshair(this.element, {
      x: left,
      y: top,
      width: width - left - right,
      height: height - top - bottom
    });

    this.crosshair.on('move', mousePosition => {
      let data = this.data;
      let currentIndex = this.scaleX.invert(mousePosition[0]);

      currentIndex = Math.ceil(currentIndex);

      if (currentIndex < 0) currentIndex = 0;
      if (currentIndex > data.length - 1) currentIndex = data.length - 1;
      let currentDataItem = data[currentIndex];

      // 计算十字线变化的坐标
      let x = this.scaleX(currentIndex);
      let y = this.scaleY(currentDataItem.current);

      // 更新十字线坐标
      this.crosshair.setHorizontalCrosslinePosition(y);
      this.crosshair.setVerticalCrosslinePosition(x);

      // 更新指示器内容和位置
      this.updateTimeIndicator(x, currentDataItem);
      this.updatePriceIndicator(y, currentDataItem);
      this.updateIncreaseIndicator(y, currentDataItem);

      // 更新顶部文字
      this.updateText(currentDataItem);
    });

    this.crosshair.on('end', () => {
      // 更新顶部文字
      this.updateText(this.data[this.data.length - 1]);
    });
  }

  // 更新顶部文字
  updateText(currentDataItem) {
    let { avg_price, current, volume } = currentDataItem;
    let text = `分时价：${current} 均价：${avg_price} 成交量：${volume}手`;
    this.element.select('.tip_text').text(text);
  }

  // 渲染时间指示器
  updateTimeIndicator(x, currentDataItem) {
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height } = this.options;
    let y = height - top - bottom + 1;

    this.timeIndicator.setText(
      d3.timeFormat('%H:%M')(currentDataItem.timestamp)
    );
    this.timeIndicator.setPosition(x, y, 'vertical');
  }

  // 渲染价格指示器
  updatePriceIndicator(y, currentDataItem) {
    let x = 0;
    let price = d3.format('.2f')(currentDataItem.current);

    this.priceIndicator.setText(price);
    this.priceIndicator.setPosition(x, y, 'horizontal');
  }

  // 渲染涨幅指示器
  updateIncreaseIndicator(y, currentDataItem) {
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height, lastClose } = this.options;
    let x = width - right - left - Indicator.WIDTH;
    let price = currentDataItem.current;
    let increase = (price - lastClose) / lastClose;

    this.increaseIndicator.setText(d3.format('.2%')(increase));
    this.increaseIndicator.setPosition(x, y, 'horizontal');
  }

  // 初始化放置数轴的容器
  initAxisGroups() {
    // 初始化数轴容器
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height } = this.options;

    this.leftAxisGroup = this.element
      .append('g')
      .attr('class', 'axis left_axis_group')
      .attr('transform', `translate(${left}, ${top})`);

    this.rightAxisGroup = this.element
      .append('g')
      .attr('class', 'axis right_axis_group')
      .attr('transform', `translate(${width - right - 1}, ${top})`);

    this.bottomAxisGroup = this.element
      .append('g')
      .attr('class', 'axis bottom_axis_group')
      .attr('transform', `translate(${left}, ${height - bottom})`);

    // 初始化辅助线
    let range = linspace(height - top - bottom, 0, 5);
    let scale = d3
      .scaleOrdinal()
      .range(range)
      .domain([1, 2, 3, 4, 5]);

    let grid_x = this.element
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
    let grid_y = this.element
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
    let { top, left, right, bottom } = Mainchart.defaultOptions.margin;
    let { width, height } = this.options;
    this.scaleX = d3.scaleLinear().range([0, width - left - right]);
    this.scaleY = d3.scaleLinear().range([height - top - bottom, 0]);
  }

  // 初始化分时线
  initLines() {
    const { left, top } = Mainchart.defaultOptions.margin;
    this.chartGroup = this.element
      .append('g')
      .attr('transform', `translate(${left}, ${top})`);
    // 均价线
    this.chartGroup.append('path').attr('class', 'area_stroke');
    // 现价分时线描边
    this.chartGroup.append('path').attr('class', 'avg_line');
    // 现价分时线填充
    this.chartGroup.append('path').attr('class', 'area_fill');
  }

  // 初始化文字指示器
  initIndicators() {
    // 价格指示器
    this.priceIndicator = new Indicator(this.crosshair.element);
    // 涨幅指示器
    this.increaseIndicator = new Indicator(this.crosshair.element);
    // 时间指示器
    this.timeIndicator = new Indicator(this.crosshair.element);
  }

  renderAxises() {
    this.renderLeftAndRightAxis();
    this.renderBottomAxis();
  }

  // 渲染左右数轴
  renderLeftAndRightAxis() {
    let { width, height } = this.options;
    let { left, right, bottom, top } = Mainchart.defaultOptions.margin;
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

    // 调整刻度文字位置和颜色(红涨绿跌)
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

  // 渲染底部数轴
  renderBottomAxis() {
    let { width, height } = this.options;
    let { left, right, bottom, top } = Mainchart.defaultOptions.margin;
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

  render(data) {
    this.data = data;
    if (this.data.length < 1) return;
    this.renderChartArea();
    this.renderAxises();

    // 顶部默认显示最后一条数据
    this.updateText(this.data[this.data.length - 1]);
  }

  renderChartArea() {
    let { scaleX, scaleY, data } = this;

    scaleX.domain([Mainchart.START_INDEX, Mainchart.END_INDEX]);

    // 根据前一天收盘价计算涨跌幅
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

    this.element.select('.area_fill').attr('d', area(data));
    this.element.select('.area_stroke').attr('d', line(data));
    this.element.select('.avg_line').attr('d', lineAvg(data));
  }

  // 创建渐变色
  createGradientDef() {
    var defs = this.element.append('defs');
    var gradient = defs
      .append('linearGradient')
      .attr('id', 'area_fill')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', 1);
    gradient
      .append('stop')
      .attr('stop-opacity', 1)
      .attr('stop-color', '#2f84cc')
      .attr('offset', 0);
    gradient
      .append('stop')
      .attr('stop-opacity', 0)
      .attr('stop-color', '#2f84cc')
      .attr('offset', 1);
  }
}

export default Mainchart;
