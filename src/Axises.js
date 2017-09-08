/**
 * 数轴类
 * 
 * @class Axises
 */
const d3 = require('d3');

class Axises {
  constructor(parentNode, scaleX, scaleY, bound) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;

    this.axisLeftGroup = parentNode.append('g').attr('class', 'axis');
    this.axisBottomGroup = parentNode.append('g').attr('class', 'axis');

    /******************辅助线开始 **************/
    this.topGroup = parentNode.append('g').attr('class', 'axis');
    this.axisTop = d3
      .axisBottom(scaleX)
      .tickSize(bound.y)
      // .ticks(4)
      .tickFormat('');

    this.rightGroup = parentNode.append('g').attr('class', 'axis');
    this.axisRight = d3
      .axisLeft(scaleY)
      .tickSize(bound.width)
      // .ticks(4)
      .tickFormat('');
    /******************辅助线结束 **************/

    this.axisLeft = d3
      .axisLeft(scaleY)
      .tickSize(0)
      .tickPadding(5)
      .ticks(6)
      .tickFormat(d3.format(',.2f'));

    this.axisBottom = d3
      .axisBottom(scaleX)
      .tickSize(0)
      .tickPadding(5)
      .ticks(4)
      .tickFormat(d3.timeFormat('%Y-%m-%d'));

    this.axisBottomGroup.attr('transform', `translate(${bound.x}, ${bound.y})`);
    this.axisLeftGroup.attr('transform', `translate(${bound.x}, 0)`);
    this.topGroup.attr('transform', `translate(${bound.x}, 0)`);
    this.rightGroup.attr('transform', `translate(${bound.x + bound.width}, 0)`);
  }

  render() {
    this.axisLeftGroup.call(this.axisLeft);
    this.axisBottomGroup.call(this.axisBottom);
    this.topGroup.call(this.axisTop);
    this.rightGroup.call(this.axisRight);
  }
}

export default Axises;
