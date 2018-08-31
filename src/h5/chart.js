import d3 from 'd3';

class Chart {
  constructor(container, width, height) {
    this.svg = d3.select('container').append('svg');
    this.svg.attr('width', width).attr('height', height);
  }

  bindEvents() {}

  zoomIn() {}

  zoomOut() {}

  renderCandles() {}

  renderWicks() {}

  render() {}
}
