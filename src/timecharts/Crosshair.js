const d3 = require('d3');

import EventEmitter from 'events';

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

    this.createEventLayer();
  }

  createEventLayer() {
    let { width, height, x, y } = this.bound;
    let { element, crossLineX, crossLineY } = this;
    let self = this;

    this.layer = this.parentNode
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'event_layer')
      .attr('transform', `translate(${x}, ${y})`)
      .on('mouseover', () => {
        element.style('display', null);
      })
      .on('mousemove', function() {
        const mousePosition = d3.mouse(this);

        crossLineX
          .attr('x1', 0)
          // .attr('y1', mousePosition[1])
          .attr('x2', width);
        // .attr('y2', mousePosition[1]);

        crossLineY
          // .attr('x1', mousePosition[0])
          .attr('y1', 0)
          // .attr('x2', mousePosition[0])
          .attr('y2', height);

        self.emit('move', mousePosition);
      })
      .on('mouseout', () => {
        element.style('display', 'none');
        self.emit('end');
      });
  }

  setHorizontalCrosslinePosition(y) {
    this.crossLineX.attr('y1', y).attr('y2', y);
  }

  setVerticalCrosslinePosition(x) {
    this.crossLineY.attr('x1', x).attr('x2', x);
  }
}

export default Crosshair;
