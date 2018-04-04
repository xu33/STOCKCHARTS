import './css/img.css';
const d3 = require('d3');
const data = require('./img_data');
const GREEN = '#27B666';
const RED = '#F54646';
const BLANK = '#FFFFFF';
const width = 400;
const height = 300;
const buyIcon = require('./css/star@1x.png');
const sellIcon = require('./css/sell@1x.png');
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
  .padding(0.2);

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
  renderWicks();
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
}

function renderWicks() {
  const line = d3
    .line()
    .x(d => d.x)
    .y(d => d.y);

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

      // 加买卖点图片并定位
      if (i == 2 || i == 58) {
        svg
          .append('svg:image')
          .attr('xlink:href', buyIcon)
          .attr('width', 27.5)
          .attr('height', 32)
          .attr('x', x - 13.25)
          .attr('y', y2);
      } else if (i == 5 || i == 19) {
        svg
          .append('svg:image')
          .attr('xlink:href', sellIcon)
          .attr('width', 14)
          .attr('height', 21)
          .attr('x', x - 7)
          .attr('y', y2);
      }

      return line([
        {
          x: x,
          y: y1
        },
        {
          x: x,
          y: y2
        }
      ]);
    })
    .attr('stroke', d => {
      if (d.open > d.close) {
        return GREEN;
      } else {
        return RED;
      }
    });
}

function renderFlags() {}

render();
