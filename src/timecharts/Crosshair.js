import * as d3 from 'd3';
import EventEmitter from 'events';
import Indicator from './Indicator';

const START_INDEX = 0;
const END_INDEX = 241;

class Crosshair extends EventEmitter {
  constructor(parentNode, options) {
    super();
    this.parentNode = parentNode;
    this.options = options;

    let { x, y } = this.options;
    this.element = this.parentNode
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .style('display', 'none');

    this.crossLineX = this.element.append('line').attr('class', 'crossline');

    this.crossLineY = this.element.append('line').attr('class', 'crossline');

    this.initScales();
    this.createEventLayer();
    this.createIndicators();
  }

  initScales() {
    let { width, height, x, y } = this.options;
    this.scaleX = d3.scaleLinear().range([0, width]);
    this.scaleY = d3.scaleLinear().range([height, 0]);
  }

  getDomainX() {
    this.timeDomain = [START_INDEX, END_INDEX];
  }

  getDomainY() {
    let start = this.options.lastClose;
    let data = this.data;
    // 最大值
    let min = d3.min(data, d => Math.min(d.current, d.avg_price));
    // 最小值
    let max = d3.max(data, d => Math.max(d.current, d.avg_price));
    // 最大跌幅
    let ratioLow = (min - start) / start;
    // 最大涨幅
    let ratioHigh = (max - start) / start;
    // 最大幅度变化
    let ratioMax = Math.max(Math.abs(ratioLow), Math.abs(ratioHigh));
    // 价格范围
    let priceDomain = [start * (1 - ratioMax), start * (1 + ratioMax)];
    // 服务范围
    let ratioDomain = [-ratioMax, ratioMax];

    this.priceDomain = priceDomain;
    this.ratioDomain = ratioDomain;
  }

  updateScales() {
    this.getDomainX();
    this.getDomainY();
    this.scaleX.domain(this.timeDomain);
    this.scaleY.domain(this.priceDomain);
  }

  createIndicators() {
    this.priceIndicator = new Indicator(this);
    this.increaseIndicator = new Indicator(this);
    this.timeIndicator = new Indicator(this);
  }

  createEventLayer() {
    let { width, height, x, y, data } = this.options;
    let { element, crossLineX, crossLineY } = this;
    let { scaleX, scaleY } = this;

    let self = this;

    let handleMouseover = function() {
      element.style('display', null);
    };

    let handleMousemove = function() {
      let [mouseX, mouseY] = d3.mouse(this);
      let currentIndex = scaleX.invert(mouseX);

      currentIndex = Math.ceil(currentIndex);

      console.log('currentIndex:', currentIndex);

      let currentItem = data[currentIndex];

      if (currentIndex < 0) {
        currentIndex = 0;
      } else if (currentIndex > data.length - 1) {
        currentIndex = data.length - 1;
      }

      {
        let x1 = 0;
        let y1 = scaleY(currentItem.current);
        let x2 = width;
        let y2 = y1;

        console.log('enter here x', x1, y1, x2, y2);

        crossLineX
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2);
      }

      {
        let x1 = scaleX(currentIndex);
        let y1 = 0;
        let x2 = x1;
        let y2 = height;

        console.log('enter here y', x1, y1, x2, y2);

        crossLineY
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2);
      }

      // self.emit('move', mousePosition);
    };

    let handleMouseout = function() {
      element.style('display', 'none');
      self.emit('end');
    };

    this.layer = this.parentNode
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'event_layer')
      .attr('transform', `translate(${x}, ${y})`)
      .on('mouseover', handleMouseover)
      .on('mousemove', handleMousemove)
      .on('mouseout', handleMouseout);
  }

  setHorizontalCrosslinePosition(y) {
    // 横向指示线的两点x坐标固定是左端和右端，所以只需要动态设置y坐标即可
    this.crossLineX.attr('y1', y).attr('y2', y);
  }

  setVerticalCrosslinePosition(x) {
    // 竖向指示线的两点y坐标固定是顶端和低端，所以只需要动态设置x坐标即可
    this.crossLineY.attr('x1', x).attr('x2', x);
  }
}

export default Crosshair;
