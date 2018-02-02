import * as d3 from 'd3';
import EventEmitter from 'events';

// bursh区域 底部的拖拽bar 暂时弃用

class Brush extends EventEmitter {
  static margin = {
    left: 10,
    right: 3,
    top: 0,
    bottom: 3
  };

  constructor(parentNode, { x, y, width, height }) {
    super();
    const { left, right, top, bottom } = Brush.margin;

    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom
    };

    let translateX = x + left;
    let translateY = y + top;
    this.element = parentNode.append('g');
    this.element
      .attr('class', 'chart-brush')
      .attr('transform', `translate(${translateX}, ${translateY})`);

    // 初始的范围
    this.initBrushSelection = [this.options.width - 100, this.options.width];

    // this.initBrushBehavior();
  }

  initBrushBehavior() {
    let width = this.options.width;
    let height = this.options.height;
    let brush = d3.brushX();

    brush.extent([[0, 0], [width, height]]);
    brush.on('brush', this.handleBrush.bind(this));

    this.element.call(brush).call(brush.move, this.initBrushSelection);
  }

  handleBrush() {
    // if (!d3.event.sourceEvent) return;
    let brushSelection = d3.event.selection;

    this.currentBrushSelection = brushSelection;
    this.emit('brush', {
      brushSelection: this.currentBrushSelection,
      range: [0, this.options.width]
    });
  }

  render() {}
}

export default Brush;
