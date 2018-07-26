/**
 * Created by shinan on 2016/12/29.
 */
import './css/yzt.css';
import { EQUAL_COLOR } from './libs/config';
const WIN_COLOR = '#ff5b5b';
const LOSS_COLOR = '#3ebf6d';
const str2number = require('./libs/str2number');
const d3 = require('d3');
const PREDICT_PERCENT = 0.7;
const MARGIN_BOTTOM = 15;
const MARGIN_RIGHT = 2;
const TEXT_MARGIN = 10;
const VOL_HEIGHT = 66;
const EventEmitter = require('events');

class Predict extends EventEmitter {
  constructor(selector, options) {
    super();
    this.options = options;

    this.svg = d3
      .select(selector)
      .append('svg')
      .attr('width', options.width)
      .attr('height', options.height);

    this.totalHeight = this.options.height;
    this.candleStickAreaHeight = options.height - MARGIN_BOTTOM;
    this.options.width = options.width - MARGIN_RIGHT;

    if (this.options.volume) {
      this.candleStickAreaHeight -= VOL_HEIGHT;
    }

    this.options.candleData = this.options.candleData.map(str2number);
    this.options.predictData = this.options.predictData.map(str2number);

    let { candleData, predictData } = options;
    let all = candleData.concat(predictData);

    let min = d3.min(all, d => +d.low);
    let max = d3.max(all, d => +d.high);

    min = min - min / 50;
    max = max + max / 50;

    let scaleY = d3
      .scaleLinear()
      .domain([min, max])
      .range([this.candleStickAreaHeight, 0]);

    this.min = min;
    this.max = max;
    this.scaleY = scaleY;
    this.render();
  }

  // 预测线
  predictLines() {
    var { svg, scaleY } = this;
    var { width, candleData, predictData } = this.options;
    var height = this.candleStickAreaHeight;
    var offset = width * PREDICT_PERCENT;
    var g = svg.append('g').attr('transform', `translate(${offset}, 0)`);
    // 预测部分虚框
    var area = d3
      .area()
      .x(d => d.x)
      .y0(0)
      .y1(d => d.y);

    g.append('path')
      .datum([
        {
          x: 0,
          y: height
        },
        {
          x: width * (1 - PREDICT_PERCENT),
          y: height
        }
      ])
      .attr('d', area)
      .attr('class', 'predict');

    var last = candleData[candleData.length - 1];

    predictData.unshift({
      high: last.close,
      low: last.close,
      close: last.close
    });

    // 预测部分折线
    var scaleX = d3
      .scaleLinear()
      .domain([0, predictData.length - 1])
      .range([0, width * (1 - PREDICT_PERCENT)]);

    this.predictScaleX = scaleX;

    // 预测区域的area
    const predictArea = d3
      .area()
      .x((d, i) => scaleX(i))
      .y0(d => scaleY(d.high))
      .y1(d => scaleY(d.low));
    g.append('path')
      .datum(predictData)
      .attr('d', predictArea)
      .attr('class', 'predict_area');

    // 预测高点
    var lineCeil = d3
      .line()
      .y(d => scaleY(d.high))
      .x((d, i) => scaleX(i));

    g.append('path')
      .datum(predictData)
      .attr('class', 'ceil')
      .attr('d', lineCeil);

    // 预测收益
    var lineProfit = d3
      .line()
      .y(d => scaleY(d.close))
      .x((d, i) => scaleX(i));

    g.append('path')
      .datum(predictData)
      .attr('class', 'profit')
      .attr('d', lineProfit);

    // 预测低点
    var lineFlor = d3
      .line()
      .y(d => scaleY(d.low))
      .x((d, i) => scaleX(i));

    g.append('path')
      .datum(predictData)
      .attr('class', 'flor')
      .attr('d', lineFlor);

    // 分割虚线
    var helpLine = d3
      .line()
      .y(d => d.y)
      .x(d => d.x);

    g.append('path')
      .datum([
        {
          x: 0,
          y: 0
        },
        {
          x: 0,
          y: this.options.volume ? this.totalHeight : height
        }
      ])
      .attr('class', 'tick-line')
      .attr('d', helpLine)
      .attr('stroke-dasharray', '5, 5');
  }

  // 蜡烛线
  candleSticks() {
    var { svg, scaleY } = this;
    var { width, candleData } = this.options;
    var height = this.candleStickAreaHeight;
    var offset = width * PREDICT_PERCENT;
    var scaleX = d3
      .scaleBand()
      .domain(candleData.map((o, i) => i))
      .range([0, offset])
      .padding(0.4);

    this.scaleBandX = scaleX;

    const group = svg.append('g').attr('class', 'candles');
    const calColor = d => {
      if (d.close > d.open) {
        return WIN_COLOR;
      } else if (d.close < d.open) {
        return LOSS_COLOR;
      } else {
        return EQUAL_COLOR;
      }
    };

    group
      .selectAll('rect')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', d => scaleY(Math.max(d.open, d.close)))
      .attr('width', scaleX.bandwidth())
      .attr('height', d => {
        var h =
          scaleY(Math.min(d.open, d.close)) - scaleY(Math.max(d.open, d.close));
        if (h < 1) {
          h = 1;
        }

        return h;
      })
      .attr('fill', calColor);

    var line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);
    group
      .selectAll('path.shadow')
      .data(candleData)
      .enter()
      .append('path')
      .attr('class', 'shadow')
      .attr('d', (d, i) => {
        var x = scaleX(i) + scaleX.bandwidth() / 2;
        var y1 = scaleY(d.high);
        var y2 = scaleY(d.low);

        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
      })
      .attr('stroke', calColor);

    this.candleGroup = group;
  }

  // 量线
  volumes() {
    var { svg } = this;
    var { width, candleData } = this.options;
    var height = this.candleStickAreaHeight;
    var min = d3.min(candleData, d => d.volume);
    var max = d3.max(candleData, d => d.volume);

    // 增加一些
    max += max / 10;

    var VOL_HEIGHT = 66;
    var offset = width * PREDICT_PERCENT;
    var scaleY = d3
      .scaleLinear()
      .domain([min, max])
      .range([VOL_HEIGHT, 0]);
    var group = svg
      .append('g')
      .attr('transform', `translate(0, ${height + MARGIN_BOTTOM - 1})`);

    group
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', VOL_HEIGHT)
      .attr('class', 'volume');

    var scaleX = this.scaleBandX;
    var rects = group
      .selectAll('.bar')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', d => {
        var y = scaleY(d.volume);
        if (y >= VOL_HEIGHT) {
          y = VOL_HEIGHT - 1;
        }

        return y;
      })
      .attr('width', scaleX.bandwidth())
      .attr('height', d => {
        var height = VOL_HEIGHT - scaleY(d.volume);

        return height < 1 ? 1 : height;
      });

    rects.attr('fill', (d, i) => {
      return d.close >= d.open ? WIN_COLOR : LOSS_COLOR;
    });

    group
      .selectAll('.bar')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'bar');
  }

  // 数轴&辅助线
  axis() {
    var { svg, scaleY } = this;
    var { width, candleData, predictData } = this.options;
    var height = this.candleStickAreaHeight;
    var offset = width * PREDICT_PERCENT;

    var scaleXReal = d3
      .scaleOrdinal()
      .domain([
        candleData[0].time,
        candleData[candleData.length - 1].time,
        // predictData[predictData.length - 1].time

        // '预测走势',
        '',
        ''
      ])
      .range([0, offset, width - (width - offset) / 2, width]);

    let { min, max } = this;
    min = +min;
    max = +max;
    let scaleYReal = d3
      .scaleOrdinal()
      .domain([min, (max + min) / 2, max])
      .range([height, height / 2, 0]);

    // 底部X轴
    var axisX = d3
      .axisBottom(scaleXReal)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN);
    // 右侧Y轴
    var axisY = d3
      .axisLeft(scaleYReal)
      .tickSize(0)
      .tickPadding(TEXT_MARGIN)
      .tickFormat(d => Number(d).toFixed(2));
    // 顶部X轴（辅助线）
    var topAxis = d3
      .axisBottom(scaleXReal)
      .tickSize(0)
      .tickFormat('');
    // 左侧Y轴
    var leftAxis = d3
      .axisRight(scaleYReal)
      .tickSize(width)
      .tickFormat('');

    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, 0)`)
      .call(topAxis);
    var leftAxisElement = svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, 0)`)
      .call(leftAxis);

    var axisXElement = svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${height})`)
      .call(axisX);
    var axisYElement = svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${width}, 0)`)
      .call(axisY);

    axisXElement.selectAll('.tick text').attr('text-anchor', 'end');

    // 偏移数轴第一个刻度值
    axisXElement.select('.tick text').attr('text-anchor', 'start');
    // 偏移第二个刻度值 防止贴辅助线太紧
    axisXElement
      .selectAll('.tick text')
      .select(function(d, i) {
        if (i == 1) {
          return this;
        }
      })
      // .attr('text-anchor', 'end')
      .attr('transform', `translate(-5, 0)`);

    axisYElement.selectAll('.tick text').each(function(d, i) {
      if (i == 2) {
        d3.select(this).attr('transform', `translate(0, 10)`);
      } else {
        d3.select(this).attr('transform', `translate(0, -10)`);
      }
    });

    // 纵向辅助线改为虚线
    var selection = leftAxisElement.selectAll('.tick line');
    selection.each(function(d, i) {
      if (i == 1) {
        d3.select(this).attr('stroke-dasharray', '5, 5');
      } else {
        d3.select(this).remove();
      }
    });

    // 预测走势
    var foWidth = width - offset;
    var triangleHeight = 4;
    var fo = this.svg.append('foreignObject').attr('width', foWidth);

    var div = fo
      .append('xhtml:div')
      .append('div')
      .attr('class', 'tooltip').html(`
      <div class="wrap" style="width:${foWidth}">
    <div class="line"></div>
    <div class="text">预测走势</div>
    <div class="line"></div>
  </div>
      `);

    fo.style(
      'transform',
      `translate(${offset}px, ${this.candleStickAreaHeight + 5}px)`
    );
  }

  /* 显示折线 */
  drawPolyline() {
    let { candleData, width } = this.options;
    let scaleX = d3
      .scaleLinear()
      .domain([0, candleData.length - 1])
      .range([0, width * PREDICT_PERCENT]);
    let scaleY = this.scaleY;
    let line = d3
      .line()
      .x((d, i) => scaleX(i))
      .y(d => scaleY(d.close));

    let group = this.svg.append('g').attr('class', 'poly');

    group
      .append('path')
      .datum(candleData)
      .attr('d', line)
      .attr('stroke', '#297cda')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    this.lineGroup = group;
  }

  togglePoly(bool) {
    if (!this.lineGroup) {
      this.drawPolyline();
    } else {
      this.lineGroup.attr('class', bool ? 'poly' : 'none');
    }
  }

  toggleCandle(bool) {
    this.candleGroup.attr('class', bool ? 'candle' : 'none');
  }

  events() {
    // let drag = d3.drag()
    //   .container(function() {
    //     return this
    //   })
    //   .on('start', () => {
    //     this.handleDragStart(d3.event.x, d3.event.y)
    //   })
    //   .on('drag', () => {
    //     this.handleDragMove(d3.event.x, d3.event.y)
    //   })
    //   .on('end', () => {
    //     this.handleDragEnd()
    //   })

    // this.svg.call(drag)

    var t = this;
    var timer;
    var interactiveEnabled = false;
    var isMobile = 'ontouchstart' in document;

    if (isMobile) {
      this.svg.on('touchstart', function() {
        let [[x, y]] = d3.touches(this);

        timer = setTimeout(() => {
          t.handleDragStart(x, y);
          interactiveEnabled = true;
        }, 500);
      });

      this.svg.on('touchmove', function() {
        if (interactiveEnabled) {
          let [[x, y]] = d3.touches(this);
          t.handleDragMove(x, y);
        } else {
          clearTimeout(timer);
        }
      });

      this.svg.on('touchend', () => {
        if (interactiveEnabled) {
          t.handleDragEnd();
        } else {
          clearTimeout(timer);
        }

        interactiveEnabled = false;
      });
    } else {
      this.svg.on('mouseenter', function() {
        let [x, y] = d3.mouse(this);
        t.handleDragStart(x, y);
      });

      this.svg.on('mousemove', function() {
        let [x, y] = d3.mouse(this);
        t.handleDragMove(x, y);
      });

      this.svg.on('mouseleave', () => {
        t.handleDragEnd();
      });
    }
  }

  getHelperLineXY(x) {
    let { candleData, predictData, width } = this.options;
    let { scaleBandX, scaleY, predictScaleX } = this;

    let offset = this.options.width * PREDICT_PERCENT;

    if (x > offset) {
      let step = (width * (1 - PREDICT_PERCENT)) / predictData.length;
      let relX = x - offset;
      let index = Math.ceil(relX / step);

      if (index < 0 || index >= predictData.length) {
        return { x: -1, y: -1, index };
      }

      let lineX = offset + predictScaleX(index);
      let lineY = scaleY(predictData[index].close);

      return {
        x: lineX,
        y: lineY,
        point: predictData[index]
      };
    } else {
      let step = scaleBandX.step();
      let index = Math.floor(x / step);

      if (index < 0 || index >= candleData.length) {
        return { x: -1, y: -1, index };
      }

      let bandWidth = scaleBandX.bandwidth();
      let lineX = scaleBandX(index) + bandWidth / 2;
      let lineY = scaleY(candleData[index].close);

      return { x: lineX, y: lineY, point: candleData[index] };
    }
  }

  handleDragStart(x) {
    var { x, y, point } = this.getHelperLineXY(x);

    if (x === -1) return;

    var hData = [
      {
        x: 0,
        y: y
      },
      {
        x: this.options.width,
        y: y
      }
    ];

    var vData = [
      {
        x: x,
        y: 0
      },
      {
        x: x,
        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
      }
    ];

    var line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    var horizontalLine = this.svg.append('path');
    var verticalLine = this.svg.append('path');

    horizontalLine
      .datum(hData)
      .attr('d', line)
      .attr('class', 'help');
    verticalLine
      .datum(vData)
      .attr('d', line)
      .attr('class', 'help');

    this.horizontalLine = horizontalLine;
    this.verticalLine = verticalLine;

    this.emit('drag-start', point);
  }

  handleDragMove(x) {
    var { x, y, point } = this.getHelperLineXY(x);

    if (x === -1) return;
    if (!this.horizontalLine) return;

    var hData = [
      {
        x: 0,
        y: y
      },
      {
        x: this.options.width,
        y: y
      }
    ];

    var vData = [
      {
        x: x,
        y: 0
      },
      {
        x: x,
        y: this.options.volume ? this.totalHeight : this.candleStickAreaHeight
      }
    ];

    var line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);
    this.horizontalLine.datum(hData).attr('d', line);
    this.verticalLine.datum(vData).attr('d', line);

    this.emit('drag-move', point);
  }

  handleDragEnd() {
    if (this.horizontalLine || this.verticalLine) {
      this.horizontalLine.remove();
      this.verticalLine.remove();
    }

    this.emit('drag-end');
  }

  render() {
    let { volume, interactive } = this.options;

    this.candleSticks();
    this.predictLines();
    this.axis();

    if (volume) {
      this.volumes();
    }

    if (interactive) {
      this.events();
    }
  }
}

module.exports = Predict;
