class Crosshair {
  constructor(parentNode, width, height, transform) {
    this.parentNode = parentNode;
    this.width = width;
    this.height = height;
    this.element = parentNode
      .append('g')
      .attr('transform', transform)
      .style('display', 'none');

    this.crossLineX = this.element
      .append('line')
      .attr('class', 'crossline')
      .attr('stroke-dasharray', '15, 10, 5, 10');

    this.crossLineY = this.element
      .append('line')
      .attr('class', 'crossline')
      .attr('stroke-dasharray', '15, 10, 5, 10');

    this.coords = [];

    this.createEventOverlay(transform);
  }

  onMove(fn) {
    this.onMoveHandler = fn;
  }

  createEventOverlay(transform) {
    const lineData = this.lineData;
    const that = this;

    this.overlay = this.parentNode
      .append('rect')
      .attr('transform', transform)
      .attr('class', 'event-overlay')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mouseover', () => {
        this.element.style('display', null);
      })
      .on('mousemove', function() {
        that.coords = that.onMoveHandler.call(this);

        if (that.coords.length > 0) {
          let [hc, vc] = that.coords;

          that.crossLineX
            .attr('x1', hc.x1)
            .attr('y1', hc.y1)
            .attr('x2', hc.x2)
            .attr('y2', hc.y2);

          that.crossLineY
            .attr('x1', vc.x1)
            .attr('y1', vc.y1)
            .attr('x2', vc.x2)
            .attr('y2', vc.y2);
        }
      })
      .on('mouseout', () => {
        this.element.style('display', 'none');
      });
  }

  createTextLabels() {}
}

export default Crosshair;
