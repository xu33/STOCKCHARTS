import * as d3 from 'd3';

class CandleStickMain {
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
    const { left, right, top, bottom } = CandleStickMain.margin;

    this.options = {
      x,
      y,
      width: width - left - right,
      height: height - top - bottom,
      data: data
    };

    let translateX = x;
    let translateY = y + top;

    this.element = parentNode.append('g');
    this.element.attr('transform', `translate(${translateX}, ${translateY})`);

    this.initGroups();
    this.initScales();
  }

  initGroups() {
    // 蜡烛图组
    this.element.append('g').attr('class', 'candle_sticks');
  }

  initScales() {
    let { left, right, bottom, top } = CandleStickMain.margin;
    let { width, height } = this.options;

    // 公用的横轴range
    let range_x = [left, width - left - right];
    // 蜡烛图比例尺
    this.scale_band = d3
      .scaleBand()
      .range(range_x)
      .padding(0.2);

    let range_y = [height, 0];
    // 纵向价格比例尺
    this.scale_price = d3.scaleLinear().range(range_y);
  }

  render() {
    if (!this.options.data || this.options.data.length < 1) return;
    this.renderCandleSticks();
    this.renderWicks();
  }

  extent() {
    let data = this.options.data;

    let min = d3.min(data, d => Math.min(d.low, d.ma5, d.ma10, d.ma20, d.ma30));
    let max = d3.max(data, d => Math.max(d.low, d.ma5, d.ma10, d.ma20, d.ma30));

    return [min, max];
  }

  renderCandleSticks() {
    let { scale_band, scale_price } = this;
    let group = this.element.select('.candle_sticks');
    let data = this.options.data;

    let domain_price = this.extent();
    let domain_x = data.map((o, i) => i);

    scale_band.domain(domain_x);
    scale_price.domain(domain_price);

    let selection = group.selectAll('.bar').data(data, d => d.time);

    selection.exit().remove();

    selection
      .enter()
      .append('rect')
      .merge(selection)
      .attr('class', 'bar')
      .attr('x', (d, i) => scale_band(i))
      .attr('y', ({ open, close }) => scale_price(Math.max(open, close)))
      .attr('width', scale_band.bandwidth())
      .attr('height', ({ open, close }) =>
        Math.round(Math.abs(scale_price(open) - scale_price(close)))
      )
      .attr('fill', calColor);
  }

  renderWicks() {
    let group = this.element.select('.candle_sticks');
    let { scale_band, scale_price, options: { data } } = this;
    let line = d3
      .line()
      .x(d => d.x)
      .y(d => d.y);

    let wicks = group.selectAll('.shadow').data(data);

    wicks.exit().remove();

    wicks
      .enter()
      .append('path')
      .merge(wicks)
      .attr('class', 'shadow')
      .attr('d', (d, i) => {
        var x = scale_band(i) + scale_band.bandwidth() / 2;
        var y1 = scale_price(d.high);
        var y2 = scale_price(d.low);

        return line([{ x: x, y: y1 }, { x: x, y: y2 }]);
      })
      .attr('stroke', calColor);
  }
}

function calColor(d) {
  if (d.close > d.open) {
    return CandleStickMain.colors.WIN_COLOR;
  } else if (d.close < d.open) {
    return CandleStickMain.colors.LOSS_COLOR;
  } else {
    return CandleStickMain.colors.EQUAL_COLOR;
  }
}

export default CandleStickMain;
