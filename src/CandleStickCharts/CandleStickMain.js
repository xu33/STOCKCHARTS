import * as d3 from 'd3';

class CandleStickMain {
  static margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 10
  };

  constructor(parentNode, { x, y, width, height }) {
    this.element = parentNode.append('g');
    const { left, right, top, bottom } = CandleStickMain.margin;

    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom
    };

    let translateX = x;
    let translateY = y + top;

    this.element.attr('transform', `translate(${translateX}, ${translateY})`);
  }

  render() {
    let { width, height } = this.options;

    this.element
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);
  }
}

export default CandleStickMain;
