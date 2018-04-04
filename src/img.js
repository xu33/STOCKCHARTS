import './css/img.css';
import computeMa from './utils/computeMa';
import { linspace } from './utils/linspace';
const d3 = require('d3');
const GREEN = '#27B666';
const RED = '#F54646';
const BLANK = '#FFFFFF';
const width = 400;
const height = 250;
const buyIcon = require('./css/star.png');
const sellIcon = require('./css/sell@1x.png');

let data = require('./img_data');
computeMa(data, 'close', 5);
computeMa(data, 'close', 10);
computeMa(data, 'close', 20);

const margin = {
  left: 0,
  right: 0,
  bottom: 40,
  top: 0
};

const svg = d3.select(document.body).append('svg');
svg.attr('width', width);
svg.attr('height', height);

const scale = d3
  .scaleBand()
  .domain(data.map((item, idx) => idx))
  .range([0, width])
  .padding(0.4);

const min = d3.min(data, d => {
  return d.low;
});

const max = d3.max(data, d => {
  return d.high;
});

const scaleY = d3
  .scaleLinear()
  .domain([min, max])
  .range([height - margin.bottom, 0]);

function render() {
  const flags = renderWicks();
  const bandwidth = scale.bandwidth();

  svg
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
      return Math.round(h);
    })
    .attr('fill', (d, i) => {
      if (d.open > d.close) {
        return GREEN;
      } else {
        // return RED;
        return BLANK;
      }
    })
    .attr('stroke', (d, i) => {
      if (d.open > d.close) {
        return 'none';
      } else {
        return RED;
      }
    });

  renderFlags(flags);
  renderMultiAvgLine();
}

function renderWicks() {
  const line = d3
    .line()
    .x(d => d.x)
    .y(d => d.y);

  const flags = [];

  svg
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

      if (i == 2 || i == 50) {
        flags.push({
          type: 'buy',
          coord: [x, y2]
        });
      }

      if (i == 30 || i == 18) {
        flags.push({
          type: 'sell',
          coord: [x, y2]
        });
      }

      return line(coords);
    })
    .attr('stroke', d => {
      if (d.open > d.close) {
        return GREEN;
      } else {
        return RED;
      }
    });

  return flags;
}

function renderFlags(flagCoords) {
  flagCoords.forEach(flagCoord => {
    // 加买卖点图片并定位
    var [x, y] = flagCoord.coord;
    if (flagCoord.type == 'buy') {
      svg
        .append('svg:image')
        .attr('xlink:href', buyIcon)
        .attr('width', 27.5)
        .attr('height', 32)
        .attr('x', x - 13.25)
        .attr('y', y);
    } else if (flagCoord.type == 'sell') {
      svg
        .append('svg:image')
        .attr('xlink:href', sellIcon)
        .attr('width', 14)
        .attr('height', 21)
        .attr('x', x - 7)
        .attr('y', y);
    }
  });
}

const scaleIndex = d3
  .scaleLinear()
  .domain([0, data.length - 1])
  .range([0, width]);

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

  let path = svg.select('.' + key);
  if (path.empty()) {
    path = svg.append('path').attr('class', key);
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

renderCells();
render();
