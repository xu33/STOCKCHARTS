const RED = '#ff3d3d';
const GREEN = '#0fc351';
const EQUAL = '#999999';

function KlineChart(element, options) {
  let { data } = options;
  let { width, height } = element.getBoundingClientRect();

  // var start = 0;
  // var end = 100;
  // var total = 1000;

  // var width = 400;

  // var scale = d3
  //   .scaleLinear()
  //   .range([0, width])
  //   .domain([start, end]);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  let priceHeightScale = d3.scaleLinear().range([height, 0]);
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

    console.log(startIndex, endIndex);
    computePriceHeightScale();
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

  const computePriceHeightScale = () => {
    console.log(data);
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

  const renderSticks = () => {
    context.clearRect(0, 0, width, height);
    let part = data.slice(startIndex, endIndex);
    const scale = d3
      .scaleBand()
      .range([0, width])
      .domain(part.map((value, index) => index))
      .padding(0.3);

    const rectWidth = scale.bandwidth();

    for (let i = 0; i < part.length; i++) {
      context.save();
      let { fOpen, fClose, fLow, fHigh } = part[i];

      // 蜡烛
      let x = scale(i);
      let y = priceHeightScale(Math.max(fOpen, fClose));
      let width = rectWidth;
      let height = Math.abs(priceHeightScale(fOpen) - priceHeightScale(fClose));
      let color;

      if (fOpen > fClose) {
        color = GREEN;
      } else if (fOpen < fClose) {
        color = RED;
      } else {
        color = EQUAL;
      }

      context.fillStyle = color;
      context.strokeStyle = color;
      context.fillRect(x, y, width, height);

      // 影线
      let y1 = priceHeightScale(fLow);
      let y2 = priceHeightScale(fHigh);
      let x1 = x + width / 2;
      let x2 = x1;

      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.closePath();
      context.stroke();

      context.restore();
    }
  };

  element.appendChild(canvas);
  computePriceHeightScale();

  initZoom();

  renderSticks();
}

export default KlineChart;
