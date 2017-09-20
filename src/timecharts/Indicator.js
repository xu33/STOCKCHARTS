/**
 * 十字线提示标签类
 * 
 * @class Indicator
 */

class Indicator {
  static INDICATOR_CLASS = 'indicator-text';
  static INDICATOR_BOX_CLASS = 'indicator-box';
  static WIDTH = 50;
  static HEIGHT = 16;
  static PADDING = 5;

  constructor(parentNode) {
    this.element = parentNode.append('g');

    this.createRect();
    this.createText();
  }

  show() {
    this.element.style('display', null);
  }

  hide() {
    this.element.style('display', 'none');
  }

  createText() {
    this.text = this.element
      .append('text')
      .attr('dx', 4)
      // .attr('y', 0)
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'start')
      .attr('class', Indicator.INDICATOR_CLASS);
  }

  createRect() {
    this.box = this.element
      .append('rect')
      .attr('class', Indicator.INDICATOR_BOX_CLASS)
      .attr('width', Indicator.WIDTH)
      .attr('height', Indicator.HEIGHT)
      .attr('x', 0)
      .attr('y', 0);
  }

  setText(text) {
    this.text.text(text);
  }

  setPosition(x, y, type) {
    let textBoundingBox = this.text.node().getBBox();
    let { width, height } = textBoundingBox;
    // let tx = (Indicator.WIDTH - width) / 2;
    let tx = 0;
    let ty = (Indicator.HEIGHT - height) / 2;

    this.text.attr('x', tx).attr('y', ty);

    if (x < 0) {
      x = 0;
    }

    if (type === 'horizontal') {
      // 水平的指示器
      y = y - Indicator.HEIGHT / 2;
    } else {
      // 垂直的指示器
      x = x - Indicator.WIDTH / 2;
      y = y + 2;
    }

    this.element.attr('transform', `translate(${x}, ${y})`);
  }
}

export default Indicator;
