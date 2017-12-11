import * as d3 from 'd3';
import EventEmitter from 'events';
import Indicator from './Indicator';

class Crosshair extends EventEmitter {
  constructor(parentNode, bound) {
    super();
    this.parentNode = parentNode;
    this.bound = bound;

    let { x, y } = this.bound;
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
    let { width, height, x, y } = this.bound;
    this.scaleX = d3.scaleLinear().range([0, width]);
    this.scaleY = d3.scaleLinear().range([height, 0]);
  }

  createIndicators() {
    this.priceIndicator = new Indicator(this);
    this.increaseIndicator = new Indicator(this);
    this.timeIndicator = new Indicator(this);
  }

  createEventLayer() {
    let { width, height, x, y } = this.bound;
    let { element, crossLineX, crossLineY } = this;
    let self = this;

    let handleMouseover = function() {
      element.style('display', null);
    };

    let handleMousemove = function() {
      const mousePosition = d3.mouse(this);

      crossLineX.attr('x1', 0).attr('x2', width);
      crossLineY.attr('y1', 0).attr('y2', height);

      self.emit('move', mousePosition);
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
