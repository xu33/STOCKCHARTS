import * as d3 from 'd3';

const RED = '#d20';
const GREEN = '#093';
const EQUAL = '#999999';
const GRID_COLOR = '#eee';
const BLUE = '#07d';

const KlineChart = (element, options) => {
  const devicePixelRatio = 1; //window.devicePixelRatio;
  // console.log(devicePixelRatio);
  let { data } = options;
  let { width, height, left, top } = element.getBoundingClientRect();
  width = width * devicePixelRatio;
  height = height * devicePixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width / devicePixelRatio + 'px';
  canvas.style.height = height / devicePixelRatio + 'px';

  const context = canvas.getContext('2d');

  let startIndex = 0;
  let endIndex = 30;

  let indexScale = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([0, width]);

  const marginBetween = 20;

  const mainBound = {
    top: 0,
    left: 0,
    width: width,
    height: height * (200 / 260)
  };

  const viceBound = {
    top: mainBound.height + marginBetween,
    left: 0,
    width: width,
    height: height - (mainBound.height + marginBetween)
  };

  let priceHeightScale = d3.scaleLinear().range([mainBound.height, 0]);

  const handleZoom = () => {
    let transform = d3.event.transform;
    let currentIndexScale = transform.rescaleX(indexScale);
    let domain = currentIndexScale.domain();

    let start = domain[0] >> 0;
    let end = domain[1] >> 0;

    if (start < 0) start = 0;
    if (end > data.length - 1) end = data.length - 1;

    if (startIndex != start || endIndex != end) {
      // 重绘
      renderSticks();
    }

    // console.log(startIndex, endIndex);
    // console.log('zoomed');
    // console.log('zoom:', startIndex, endIndex);
    startIndex = start;
    endIndex = end;
  };

  const handleZoomEnd = () => {};

  const initZoom = () => {
    let k = data.length / (endIndex - startIndex);

    if (k < 1) {
      k = 1;
    }

    let tx = 0;
    let ty = 0;
    let transform = d3.zoomIdentity.scale(k).translate(tx, ty);
    let zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, 0]])
      .scaleExtent([1, k])
      .on('zoom', handleZoom)
      .on('end', handleZoomEnd);

    d3.select(element)
      .call(zoom)
      .call(zoom.transform, transform);
  };

  const drawRect = (x, y, width, height, fill = true) => {
    x = parseInt(x);
    y = parseInt(y);
    width = parseInt(width); //+ 0.5;
    height = parseInt(height); //+ 0.5;

    // console.log(x, y, width, height);

    if (fill) {
      context.fillRect(x, y, width, height);
    } else {
      x += 0.5;
      y += 0.5;
      context.strokeRect(x, y, width, height);
    }
  };

  const drawLine = (x1, y1, x2, y2) => {
    x1 = parseInt(x1) + 0.5;
    y1 = parseInt(y1) + 0.5;
    x2 = parseInt(x2) + 0.5;
    y2 = parseInt(y2) + 0.5;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.stroke();
    context.closePath();
  };

  const drawLineWith = (context, x1, y1, x2, y2) => {
    x1 = parseInt(x1) + 0.5;
    y1 = parseInt(y1) + 0.5;
    x2 = parseInt(x2) + 0.5;
    y2 = parseInt(y2) + 0.5;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.stroke();
    context.closePath();
  };

  const computePriceHeightScale = () => {
    let part = data.slice(startIndex, endIndex);
    let min = Math.min(
      ...part.map(v => {
        return Math.min(v.fClose, v.fLow, v.fOpen, v.fHigh);
      })
    );

    let max = Math.max(
      ...part.map(v => {
        return Math.max(v.fClose, v.fLow, v.fOpen, v.fHigh);
      })
    );

    priceHeightScale.domain([min, max]);
  };

  // 价格轴
  const renderLeftAxis = () => {
    let priceDomain = priceHeightScale.domain();
    let [min, max] = priceDomain;
    let i1 = d3.interpolateNumber(mainBound.height, 0);
    let i2 = d3.interpolateNumber(min, max);

    for (let i = 0; i <= 6; i++) {
      let x = 4;
      let y = i1(i / 6);
      let text = i2(i / 6).toFixed(2);

      if (i == 6) {
        y += 12;
      } else {
        y -= 4;
      }

      context.fillText(text, x, y);
    }
  };

  const renderHozGrids = (width, height, count = 6) => {
    let interpolator = d3.interpolateNumber(height, 0);
    let range = [];
    for (let i = 0; i <= count; i++) {
      range.push(interpolator(i / count));
    }

    context.save();
    context.strokeWidth = 2;
    context.strokeStyle = GRID_COLOR;
    range.forEach(y => {
      drawLine(0, y, width, y);
    });
    context.restore();
  };

  const renderVerGrids = (width, height, count = 4) => {
    let interpolator = d3.interpolateNumber(0, width - 1);
    let range = [];
    for (let i = 0; i <= count; i++) {
      range.push(interpolator(i / count));
    }

    context.save();
    context.strokeWidth = 2;
    context.strokeStyle = GRID_COLOR;
    range.forEach(x => {
      drawLine(x, 0, x, height);
    });
    context.restore();
  };

  const scale = d3
    .scaleBand()
    .range([0, mainBound.width])
    .padding(0.3);

  const renderSticks = () => {
    // console.log('render fired');
    context.clearRect(0, 0, width, height);

    // 根据数据范围新计算比例尺
    computePriceHeightScale();
    // 辅助线
    renderHozGrids(mainBound.width, mainBound.height);
    renderVerGrids(mainBound.width, mainBound.height);
    // 价格轴
    renderLeftAxis();

    let part = data.slice(startIndex, endIndex);

    scale.domain(part.map((value, index) => index));

    const rectWidth = scale.bandwidth();
    // context.globalCompositeOperation = 'destination-out';
    // context.globalAlpha = 1;

    if (rectWidth < 3) {
      context.save();
      context.strokeStyle = BLUE;
      context.beginPath();
      for (let i = 0; i < part.length; i++) {
        let { fClose } = part[i];
        let x = scale(i);
        let y = priceHeightScale(fClose);

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
      context.closePath();

      context.restore();
    } else {
      for (let i = 0; i < part.length; i++) {
        context.save();
        let { fOpen, fClose, fLow, fHigh } = part[i];
        let color, fill;

        if (fOpen > fClose) {
          color = GREEN;
          fill = true;
        } else {
          color = RED;
          fill = false;
        }

        context.fillStyle = color;
        context.strokeStyle = color;

        let x = scale(i);
        let x1 = x + rectWidth / 2;
        let x2 = x1;

        // 上影线
        {
          let y1 = priceHeightScale(fHigh);
          let y2;
          if (fOpen > fClose) {
            y2 = priceHeightScale(fOpen);
          } else {
            y2 = priceHeightScale(fClose);
          }

          drawLine(x1, y1, x2, y2);
        }

        // 下影线
        {
          let y1 = priceHeightScale(fLow);
          let y2;
          if (fOpen > fClose) {
            y2 = priceHeightScale(fClose);
          } else {
            y2 = priceHeightScale(fOpen);
          }
          drawLine(x1, y1, x2, y2);
        }

        // 蜡烛
        let y = priceHeightScale(Math.max(fOpen, fClose));
        let width = rectWidth;
        let height = Math.abs(
          priceHeightScale(fOpen) - priceHeightScale(fClose)
        );

        drawRect(x, y, width, height, fill);

        context.restore();
      }
    }

    viceChart(part);
  };

  const volumeHeightScale = d3.scaleLinear();

  const viceChart = data => {
    const { top, left, height } = viceBound;
    let minVol = 0;
    let maxVol = Math.max(...data.map(o => o.lVolume));

    volumeHeightScale.domain([minVol, maxVol]).range([height, 0]);

    context.save();
    context.translate(left, top);

    renderHozGrids(viceBound.width, viceBound.height, 3);
    renderVerGrids(viceBound.width, viceBound.height);

    let rectWidth = scale.bandwidth();

    for (let i = 0, j = data.length; i < j; i++) {
      context.save();

      let { lVolume, fClose, fOpen } = data[i];

      let x = scale(i);
      let y = volumeHeightScale(lVolume);
      let rectHeight = volumeHeightScale(minVol) - y;

      // console.log(rectHeight);
      let color;

      if (fClose > fOpen) {
        color = RED;
      } else {
        color = GREEN;
      }

      context.fillStyle = color;
      context.strokeStyle = color;

      if (rectWidth > 2) {
        drawRect(x, y, rectWidth, rectHeight, color === GREEN);
      } else {
        drawLine(x, y, x, height);
      }

      context.restore();
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.restore();
  };

  // element.appendChild(canvas);

  const overlay = document.createElement('canvas');
  const ctx = overlay.getContext('2d');
  overlay.width = width;
  overlay.height = height;

  const bindEvents = () => {
    const handleMouseover = e => {};

    const handleMousemove = e => {
      let x = e.pageX;
      let y = e.pageY;

      // 减去偏移量
      x = x - left;
      y = y - top;

      // 计算落在哪跟k线
      let step = scale.step();
      let paddingOuter = scale.paddingOuter();
      let n = Math.floor((x - paddingOuter) / step);
      let theX = scale(n);

      x = theX + scale.bandwidth() / 2;

      ctx.save();
      ctx.setLineDash([3, 4]);

      // 画线 垂直
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#555';
      drawLineWith(ctx, x, 0, x, height);
      // 水平
      drawLineWith(ctx, 0, y, width, y);
      ctx.restore();
    };

    const handleMouseout = e => {
      ctx.clearRect(0, 0, width, height);
    };

    element.addEventListener('mouseover', handleMouseover);
    element.addEventListener('mousemove', handleMousemove);
    element.addEventListener('mouseout', handleMouseout);

    return () => {
      element.removeEventListener('mouseover', handleMouseover);
      element.removeEventListener('mousemove', handleMousemove);
      element.removeEventListener('mouseout', handleMouseout);
    };
  };

  return {
    render() {
      element.appendChild(canvas);
      element.appendChild(overlay);

      // 绘制
      renderSticks();
      // 绑定缩放事件
      initZoom();
      // 绑定交互
      bindEvents();
    },
    destroy: () => {
      d3.select(element).on('.zoom', null);
      element.removeChild(canvas);
    }
  };
};

export default KlineChart;
