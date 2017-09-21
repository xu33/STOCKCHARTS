class Dragbar {
  static margin = {
    left: 0,
    right: 0,
    top: 10,
    bottom: 0
  };

  constructor(parentNode, { x, y, width, height }) {
    this.element = parentNode.append('g');

    const { left, right, top, bottom } = Dragbar.margin;

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

export default Dragbar;
