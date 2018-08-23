import './chart_utils/css/img.css';
import { linspace } from './chart_utils/linspace';
const d3 = require('d3');
const GREEN = '#27B666';
const RED = '#F54646';
const BLANK = '#FFFFFF';
const starIcon = require('./chart_utils/css/star.png');
const buyIcon = require('./chart_utils/css/B@2x.png');
const sellIcon = require('./chart_utils/css/sell.png');
const starIconWidth = 55 / 2;
const starIconHeight = 64 / 2;
const buyIconWidth = 28 / 2;
const buyIconHeight = 42 / 2;
const sellIconWidth = 28 / 2;
const sellIconHeight = 42 / 2;

const KlineBuySellChart = function(element, options) {
  let data = options.data;
  let width = options.width;
  let height = options.height;

  const margin = {
    left: 0,
    right: 0,
    bottom: 0,
    top: 20
  };

  margin.bottom = Math.max(starIconHeight, sellIconHeight);
  margin.left = Math.max(starIconWidth, sellIconWidth) / 2;
  margin.right = Math.max(starIconWidth, sellIconWidth) / 2;

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
    .paddingInner(0.2)
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
  const minMaxFlags = {};

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

    renderFlags();
    renderMultiAvgLine();
    renderMinMaxFlags();
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

        if (d.mField.star >= 3) {
          flags.push({
            type: 'star',
            coord: [x, y2]
          });
        } else if (d.mField.B != 0) {
          flags.push({
            type: 'buy',
            coord: [x, y2]
          });
        } else if (d.mField.S != 0) {
          flags.push({
            type: 'sell',
            coord: [x, y1]
          });
        }

        if (d.low == minPrice) {
          minMaxFlags.min = {
            index: i,
            text: minPrice,
            coord: [x, y2]
          };
        }

        if (d.high == maxPrice) {
          minMaxFlags.max = {
            index: i,
            text: maxPrice,
            coord: [x, y1]
          };
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
    for (var key in minMaxFlags) {
      let flag = minMaxFlags[key];
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
    }
  }

  function renderFlags() {
    flags.forEach(flagCoord => {
      // 加买卖点图片并定位
      var [x, y] = flagCoord.coord;
      if (flagCoord.type == 'buy') {
        group
          .append('svg:image')
          .attr('xlink:href', buyIcon)
          .attr('width', buyIconWidth)
          .attr('height', buyIconHeight)
          .attr('x', x - buyIconWidth / 2)
          .attr('y', y);
      } else if (flagCoord.type == 'sell') {
        group
          .append('svg:image')
          .attr('xlink:href', sellIcon)
          .attr('width', sellIconWidth)
          .attr('height', sellIconHeight)
          .attr('x', x - sellIconWidth / 2)
          .attr('y', y - sellIconHeight);
      } else if (flagCoord.type == 'star') {
        group
          .append('svg:image')
          .attr('xlink:href', starIcon)
          .attr('width', starIconWidth)
          .attr('height', starIconHeight)
          .attr('x', x - starIconWidth / 2)
          .attr('y', y);
      }
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
    renderAvgLines(60);
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

  render();

  return {
    destroy: function() {
      svg.node().remove();
    }
  };
};

module.exports = KlineBuySellChart;
