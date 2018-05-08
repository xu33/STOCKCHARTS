import './css/img.css';
import computeMa from './utils/computeMa';
import { linspace } from './utils/linspace';
import { curveMonotoneY } from 'd3';
const d3 = require('d3');
const GREEN = '#27B666';
const RED = '#F54646';
const BLANK = '#FFFFFF';
const width = 750;
const height = 500;
const buyIcon = require('./css/star.png');
const sellIcon = require('./css/sell@1x.png');
const rangeColor = '#3691e1';

let data = require('./img_data');

const KlineBuySellChart = function(element, options) {
  let data = options.data;
  let width = options.width;
  let height = options.height;

  const margin = {
    left: 10,
    right: 10,
    bottom: 30,
    top: 10
  };

  const svg = d3.select(element).append('svg');

  svg.attr('width', width);
  svg.attr('height', height);

  renderCells();

  const group = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const scale = d3
    .scaleBand()
    .domain(data.map((item, idx) => idx))
    .range([0, width - margin.left - margin.right])
    .paddingInner(0.4)
    .paddingOuter(0);

  const min = d3.min(data, d => {
    return Math.min.apply(Math, [d.low, d.ma5, d.ma10, d.ma20]);
  });

  const max = d3.max(data, d => {
    return Math.max.apply(Math, [d.high, d.ma5, d.ma10, d.ma20]);
  });

  const scaleY = d3
    .scaleLinear()
    .domain([min, max])
    .range([height - margin.top - margin.bottom, 0]);

  const flags = [];
  const minMaxFlags = [];

  function render() {
    renderWicks();

    const bandwidth = scale.bandwidth();

    group
      .selectAll('.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candle')
      .attr('x', (d, i) => scale(i))
      .attr('y', d => {
        return scaleY(Math.max(d.open, d.close));
      })
      .attr('width', bandwidth)
      .attr('height', d => {
        var y1 = scaleY(d.open);
        var y2 = scaleY(d.close);
        var h = Math.abs(y1 - y2);
        return h < 1 ? 1 : h;
      })
      .attr('fill', (d, i) => {
        if (d.open >= d.close) {
          return GREEN;
        } else {
          return BLANK;
        }
      })
      .attr('stroke', (d, i) => {
        if (d.open >= d.close) {
          return null;
        } else {
          return RED;
        }
      });
    renderMultiAvgLine();
    // renderMinMaxFlags();
  }

  const minPrice = d3.min(data, d => d.low);
  const maxPrice = d3.max(data, d => d.high);

  function renderWicks() {
    const line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    group
      .selectAll('.shadow')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'shadow')
      .attr('d', (d, i) => {
        const x = scale(i) + scale.bandwidth() / 2;
        const y1 = scaleY(d.high);
        const y2 = scaleY(d.low);

        const coords = [
          {
            x: x,
            y: y1
          },
          {
            x: x,
            y: y2
          }
        ];

        // if (d.mField.star >= 3) {
        //   flags.push({
        //     type: 'star',
        //     coord: [x, y2]
        //   });
        // } else if (d.mField.B != 0) {
        //   flags.push({
        //     type: 'buy',
        //     coord: [x, y2]
        //   });
        // } else if (d.mField.S != 0) {
        //   flags.push({
        //     type: 'sell',
        //     coord: [x, y1]
        //   });
        // }

        if (d.low == minPrice) {
          minMaxFlags.push({
            index: i,
            text: minPrice,
            coord: [x, y2]
          });
        }

        if (d.high == maxPrice) {
          minMaxFlags.push({
            index: i,
            text: maxPrice,
            coord: [x, y1]
          });
        }

        if (d.high == d.low && d.close == d.open && d.open == d.high) {
          return null;
        } else {
          return line(coords);
        }
      })
      .attr('stroke', d => {
        if (d.high == d.low && d.close == d.open && d.open == d.high) {
          return null;
        } else {
          if (d.open >= d.close) {
            return GREEN;
          } else {
            return RED;
          }
        }
      });
  }

  function renderMinMaxFlags() {
    minMaxFlags.forEach(flag => {
      let [x, y] = flag.coord;
      let { text, index } = flag;

      let pointTo;
      if (index > data.length - 10) {
        pointTo = 'left';
      } else {
        pointTo = 'right';
      }

      let lineFn = d3
        .line()
        .x(d => d[0])
        .y(d => d[1]);

      let path = group.append('path').attr('stroke', '#A0A0A0');

      let textEl = group
        .append('text')
        .text(d3.format('.2f')(text))
        .attr('fill', '#A0A0A0');

      const lineOffset = 20;
      const textOffset = 4;
      if (pointTo == 'left') {
        let coords = [[x - lineOffset, y], [x, y]];

        let bbox = textEl.node().getBBox();
        let textWidth = bbox.width;
        path.attr('d', lineFn(coords));
        textEl.attr('x', x - lineOffset - textWidth).attr('y', y + textOffset);
      } else {
        let coords = [[x, y], [x + lineOffset, y]];
        path.attr('d', lineFn(coords));
        textEl.attr('x', x + lineOffset).attr('y', y + textOffset);
      }

      path.attr('stroke-dasharray', '4 2');
    });
  }

  const scaleIndex = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width - margin.left - margin.right]);

  function renderAvgLines(days) {
    const key = 'ma' + days;
    const line = d3
      .line()
      .x((d, i) => {
        return scaleIndex(i);
      })
      .y((d, i) => {
        return scaleY(d[key]);
      })
      .defined(d => {
        return d.hasOwnProperty(key);
      });

    let path = group.select('.' + key);
    if (path.empty()) {
      path = group.append('path').attr('class', key);
    }

    path.attr('d', line(data));
  }

  function renderMultiAvgLine() {
    renderAvgLines(5);
    renderAvgLines(10);
    renderAvgLines(20);
  }

  function renderCells() {
    let cellsDomain = [0, 1, 2, 3, 4, 5];
    let cellsRange = linspace(0, width - 1, 6);

    let scale = d3
      .scaleOrdinal()
      .domain(cellsDomain)
      .range(cellsRange);

    let bottomAxis = d3
      .axisBottom(scale)
      .tickSize(-height)
      .tickFormat('');

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    cellsDomain = [0, 1, 2];
    cellsRange = linspace(height - 1, 0, 3);

    scale = d3
      .scaleOrdinal()
      .domain(cellsDomain)
      .range(cellsRange);

    let leftAxis = d3
      .axisLeft(scale)
      .tickSize(-width)
      .tickFormat('');
    svg
      .append('g')
      .attr('transform', `translate(0, 0)`)
      .call(leftAxis);
  }

  // 框选形态
  function renderRangeBox() {
    if (!options.rangeIdxs) {
      return;
    }
    let rangeIdxs = options.rangeIdxs;
    let rangeData = [];

    // 需要替换成真实逻辑
    data.forEach(function(item, idx) {
      if (rangeIdxs.indexOf(idx) > -1) {
        item.idx = idx;
        rangeData.push(item);
      }
    });

    // console.log(rangeData);

    let paddingVertical = 5;
    let paddingHorz = 2;
    let max = d3.max(rangeData, d => d.high);
    let min = d3.min(rangeData, d => d.low);
    let len = rangeData.length;
    // 保存x后面tip使用
    let tipX;
    let area = d3
      .area()
      .x((d, i) => {
        if (i == 0) {
          // let x = scaleIndex(d.idx) - paddingHorz;
          let x = scale(d.idx) - paddingHorz;
          // 保存x后面tip使用
          tipX = x;
          return x;
        } else if (i == len - 1) {
          // return (
          //   scaleIndex(d.idx + 1) -
          //   (scale.step() - scale.bandwidth()) +
          //   paddingHorz
          // );

          return scale(d.idx) + scale.bandwidth() + paddingHorz;
        } else {
          // return scaleIndex(d.idx);
          return scale(d.idx);
        }
      })
      .y0(scaleY(max) - paddingVertical)
      .y1(scaleY(min) + paddingVertical);

    group
      .append('path')
      .attr('d', area(rangeData))
      .attr('fill', rangeColor)
      .attr('opacity', 0.4);

    renderRangeTip(tipX, scaleY(min) + paddingVertical);
  }

  function renderRangeTip(x, y) {
    if (!options.rangeName) {
      return;
    }
    // 先设置一个长的避免换行
    var foWidth = 600;
    var triangleHeight = 4;
    var fo = svg.append('foreignObject').attr('width', foWidth);

    var div = fo
      .append('xhtml:div')
      .append('div')
      .attr('class', 'tooltip')
      .html(options.rangeName);

    var triangle = div.append('div').attr('class', 'tri');
    var boundingBox = div.node().getBoundingClientRect();
    var foHeight = boundingBox.height;
    var foWidth = boundingBox.width;

    // fo.attr('height', foHeight);
    // fo.attr('width', foWidth);

    if (x + margin.left + foWidth > options.width) {
      triangle.attr('class', 'tri_right');
      // 35不是准确值，应该根据上下box的差计算，后续有时间修改
      fo.attr('x', x + margin.left - 35);
      fo.attr('y', y + margin.top + triangleHeight);
    } else {
      // foreignObject不会继承group的transform?
      fo.attr('x', x + margin.left);
      fo.attr('y', y + margin.top + triangleHeight);
    }
  }

  render();
  renderRangeBox();

  return {
    destroy: function() {
      svg.node().remove();
    }
  };
};

// 测试数据
let rangeIdxs = [1, 2, 3, 4];
let chart = new KlineBuySellChart(document.body, {
  data: data,
  width: 500,
  height: 250,
  rangeIdxs: rangeIdxs,
  rangeName: '启明之星'
});
