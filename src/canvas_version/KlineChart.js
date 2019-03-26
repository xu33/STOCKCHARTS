const RED = '#d20';
const GREEN = '#093';
const EQUAL = '#999999';
const GRID_COLOR = '#edf0f5';
const BLUE = '#07d';

function KlineChart(element, options) {
  let { data } = options;
  let { width, height } = element.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  let startIndex = 0;
  let endIndex = 30;

  let indexScale = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([0, width]);

  const handleZoom = () => {
    let transform = d3.event.transform;
    let currentIndexScale = transform.rescaleX(indexScale);
    let domain = currentIndexScale.domain();

    startIndex = domain[0] >> 0;
    endIndex = domain[1] >> 0;

    if (startIndex < 0) startIndex = 0;
    if (endIndex > data.length - 1) endIndex = data.length - 1;

    // console.log(startIndex, endIndex);
    renderSticks();
  };

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
      .on('zoom', handleZoom);

    d3.select(element)
      .call(zoom)
      .call(zoom.transform, transform);
  };

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

  const drawRect = (x, y, width, height, fill = true) => {
    x = parseInt(x) + 0.5;
    y = parseInt(y) + 0.5;
    width = parseInt(width) + 0.5;
    height = parseInt(height) + 0.5;

    if (fill) {
      context.fillRect(x, y, width, height);
    } else {
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

  const computePriceHeightScale = () => {
    let part = data.slice(startIndex, endIndex);
    let min = Math.min.apply(
      Math,
      part.map(v => {
        return Math.min(v.fClose, v.fLow, v.fOpen, v.fHigh);
      })
    );

    let max = Math.max.apply(
      Math,
      part.map(v => {
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

  // 辅助线
  const renderGrids = () => {
    renderHozGrids();
    renderVerGrids();
  };

  const renderHozGrids = () => {
    let interpolator = d3.interpolateNumber(mainBound.height, 0);
    let range = [];
    let lineNumbers = 6;
    for (let i = 0; i <= lineNumbers; i++) {
      range.push(interpolator(i / lineNumbers));
    }

    context.save();
    context.strokeWidth = 2;
    context.strokeStyle = GRID_COLOR;
    range.forEach(y => {
      drawLine(0, y, mainBound.width, y);
    });
    context.restore();
  };

  const renderVerGrids = () => {
    let interpolator = d3.interpolateNumber(0, mainBound.width);
    let range = [];
    let lineNumbers = 4;
    for (let i = 0; i <= lineNumbers; i++) {
      range.push(interpolator(i / lineNumbers));
    }

    context.save();
    context.strokeWidth = 2;

    context.strokeStyle = GRID_COLOR;
    range.forEach(x => {
      drawLine(x, 0, x, mainBound.height);
    });
    context.restore();
  };

  const scale = d3
    .scaleBand()
    .range([0, mainBound.width])
    .padding(0.3);

  const renderSticks = () => {
    context.clearRect(0, 0, width, height);

    // 根据数据范围新计算比例尺
    computePriceHeightScale();
    renderGrids();
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

    let rectWidth = scale.bandwidth();

    for (let i = 0, j = data.length; i < j; i++) {
      context.save();

      let { lVolume, fClose, fOpen } = data[i];

      let x = scale(i);
      let y = volumeHeightScale(lVolume);
      let rectHeight = volumeHeightScale(0);
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

  element.appendChild(canvas);

  // 绑定缩放事件
  initZoom();

  return {
    render: renderSticks
  };
}

export default KlineChart;
