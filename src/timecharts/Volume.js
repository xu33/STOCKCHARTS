const d3 = require('d3');

class Volume {
  static START_INDEX = 0;
  static END_INDEX = 241;
  static PERCENT = 0.24;

  constructor(parentNode, { x, y, width, height, data }) {
    this.element = parentNode.append('g');
    this.element.attr('transform', `translate(${x}, ${y})`);
    this.scaleX = d3
      .scaleLinear()
      .range([0, width])
      .domain([Volume.START_INDEX, Volume.END_INDEX]);
    this.scaleY = d3.scaleLinear().range([height, 0]);

    this.data = data;
    this.width = width;
    this.height = height;
  }

  render() {
    let { scaleX, scaleY, width, height, data } = this;
    let extent = d3.extent(data);

    extent[1] = extent[1] * 1.2;

    scaleY.domain(extent);

    let selection = this.element.selectAll('.volume').data(this.data, d => d);

    selection.exit().remove();

    selection
      .enter()
      .append('line')
      .merge(selection)
      .attr('class', 'volume')
      .attr('x1', (d, i) => scaleX(i))
      .attr('y1', d => scaleY(d))
      .attr('x2', (d, i) => scaleX(i))
      .attr('y2', height);
  }

  renderGrids() {}

  update(item) {
    if (!Array.isArray(item)) {
      item = [item];
    }
    for (var i = 0; i < item.length; i++) {
      this.data.push(item[i]);
    }
    this.render();
  }
}

export default Volume;
