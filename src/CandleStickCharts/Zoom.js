import * as d3 from 'd3';

class Zoom {
  constructor(zoomer, options) {
    this.zoomer = zoomer;

    this.startIndex = 0;
    this.endIndex = this.options.data.length - 1;
  }

  initZoom() {
    var { width, height } = this.options;
    // 最初展示的K线数量
    var minStickLength = 30;
    // 最初展示的K线数量占总K线数量的百分比
    var percent = minStickLength / this.options.data.length;

    console.log('percent', percent);

    // 宽度占比，后面会根据缩放比例进行缩放
    var percentWidth = width * percent;

    // 索引——宽度 比例尺
    var indexScaleCopy = this.getIndexScale();

    // 最大缩放比例
    var maxScale = this.options.width / percentWidth;
    // 初始缩放比例
    var initScale = maxScale;

    console.log('initScale', initScale);

    var startIndex = 0;
    var endIndex = this.options.data.length - 1;
    var zoomed = () => {
      var transform = d3.event.transform;
      var domain = transform.rescaleX(indexScaleCopy).domain();

      let [selectedStartIndex, selectedEndIndex] = domain;
      console.log(`当前数据范围: ${selectedStartIndex} - ${selectedEndIndex}`);

      if (selectedStartIndex < startIndex || selectedEndIndex > endIndex) {
        console.error('数据索引错误');
        return;
      }

      selectedStartIndex = Math.round(selectedStartIndex);
      selectedEndIndex = Math.round(selectedEndIndex);

      let selectedData = this.options.data.slice(
        selectedStartIndex,
        selectedEndIndex
      );

      this.selectedData = selectedData;
      this.render();
    };

    // 初始化zoom行为
    var zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, height]])
      .scaleExtent([1, maxScale])
      .on('zoom', zoomed);

    // 设置初始的缩放和平移
    var initTransform = d3.zoomIdentity
      .scale(initScale)
      .translate(-(width - percentWidth), 0); // 一开始从最右侧，也就是最新的显示

    this.zoomer.call(zoom).call(zoom.transform, initTransform);
  }
}

export default Zoom;
