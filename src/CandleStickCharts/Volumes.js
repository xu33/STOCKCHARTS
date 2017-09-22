import * as d3 from 'd3';

class Volumes {
  static colors = {
    WIN_COLOR: '#ff3d3d',
    LOSS_COLOR: '#0fc351',
    EQUAL_COLOR: '#999999'
  };

  static margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 10
  };

  constructor(parentNode, { x, y, width, height, data }) {
    const { left, right, top, bottom } = Volumes.margin;

    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom,
      data
    };

    let translateX = x;
    let translateY = y + top;
    this.element = parentNode.append('g');
    this.element.attr('transform', `translate(${translateX}, ${translateY})`);
    this.initScales();
  }

  initScales() {
    let { left, right, top, bottom } = Volumes.margin;
    let { width, height } = this.options;
    let range_volume = [height, 0];
    this.scale_volume = d3.scaleLinear().range(range_volume);

    let range_x = [left, width - left - right];
    this.scale_band = d3
      .scaleBand()
      .range(range_x)
      .padding(0.2);
  }

  render() {
    let { width, height, data } = this.options;
    let { scale_band, scale_volume } = this;

    let domain_x = data.map((o, i) => i);

    scale_band.domain(domain_x);

    let domain_volume = d3.extent(data, d => d.volume);
    scale_volume.domain(domain_volume);

    let selection = this.element.selectAll('.bar').data(data);
    selection.exit().remove();

    selection
      .enter()
      .append('rect')
      .merge(selection)
      .attr('class', 'bar')
      .attr('x', (d, i) => scale_band(i))
      .attr('y', d => scale_volume(d.volume))
      .attr('width', scale_band.bandwidth())
      .attr('height', d => height - scale_volume(d.volume))
      .attr('fill', calColor);
  }
}

function calColor(d) {
  if (d.close > d.open) {
    return Volumes.colors.WIN_COLOR;
  } else if (d.close < d.open) {
    return Volumes.colors.LOSS_COLOR;
  } else {
    return Volumes.colors.EQUAL_COLOR;
  }
}

export default Volumes;
