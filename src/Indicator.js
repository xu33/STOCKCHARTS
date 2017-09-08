/**
 * 十字线提示标签类
 * 
 * @class Indicator
 */

class Indicator {
  static INDICATOR_CLASS = 'indicator-text';
  static INDICATOR_BOX_CLASS = 'indicator-box';
  static PADDING = 3;

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
      .attr('x', 0)
      .attr('y', 0)
      // .attr('alignment-baseline', 'start')
      // .attr('text-anchor', 'start')
      .attr('class', Indicator.INDICATOR_CLASS);
  }

  createRect() {
    this.box = this.element
      .append('rect')
      .attr('class', Indicator.INDICATOR_BOX_CLASS)
      .attr('x', 0)
      .attr('y', 0);
  }

  setText(text) {
    this.text.text(text);

    // console.log(boundingBox);
    // this.text.attr('y', 0);

    // let x = (Indicator.WIDTH - boundingBox.width) / 2;
    // let y = (Indicator.HEIGHT - boundingBox.height) / 2;
    // this.text.attr('x', x).attr('y', y);
  }

  setPosition(x, y, type) {
    let textBoundingBox = this.text.node().getBBox();
    let { width, height } = textBoundingBox;
    let boxWidth = width + Indicator.PADDING * 2;
    let boxHeight = height + Indicator.PADDING * 2;

    this.box.attr('width', boxWidth).attr('height', boxHeight);
    this.text.attr('x', Indicator.PADDING);
    this.text.attr('y', height);

    if (type === 'horizontal') {
      x = x - boxWidth;
      y = y - boxHeight / 2;
    } else if (type === 'vertical') {
      x = x - boxWidth / 2;
    }

    this.element.attr('transform', `translate(${x}, ${y})`);
  }
}

export default Indicator;
