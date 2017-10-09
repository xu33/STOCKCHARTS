/**
 * 十字线提示标签类
 * 
 * @class Indicator
 */
class Indicator {
  static INDICATOR_CLASS = 'indicator-text';
  static INDICATOR_BOX_CLASS = 'indicator-box';
  static TEXT_PADDING = 2;

  constructor(parentNode, width, height) {
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
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'start')
      .attr('class', Indicator.INDICATOR_CLASS);
  }

  createRect() {
    this.box = this.element
      .append('rect')
      .attr('class', Indicator.INDICATOR_BOX_CLASS);
  }

  setText(text) {
    this.text.text(text);
  }

  setPosition(x, y, type, direction) {
    let TEXT_PADDING = Indicator.TEXT_PADDING;
    let textBoundingBox = this.text.node().getBBox();
    let { width, height } = textBoundingBox;
    let boxWidth = width + TEXT_PADDING * 2; // padding left and right is 2
    let boxHeight = height;
    this.text.attr('dx', TEXT_PADDING);

    this.box
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('x', textBoundingBox.x - TEXT_PADDING)
      .attr('y', textBoundingBox.y);

    // let tx = (Indicator.WIDTH - width) / 2;
    // let tx = 0;
    // let ty = (this.height - height) / 2;

    // this.text.attr('x', tx).attr('y', ty);

    if (type === 'horizontal') {
      // 水平的指示器
      y = y - boxHeight / 2;
    } else {
      // 垂直的指示器
      x = x - boxWidth / 2;
      y = y + 3;
    }

    if (direction === 'right') {
      x = x - boxWidth;
    }

    if (x < 0) {
      x = 0;
    }

    this.element.attr('transform', `translate(${x}, ${y})`);
  }
}

export default Indicator;
