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

  const computePriceHeightScale = () => {
    console.log(data);
    let min = Math.min.apply(
      Math,
      data.map(v => {
        return Math.min(v.fClose, v.fLow, v.fOpen, v.fHigh);
      })
    );

    let max = Math.max.apply(
      Math,
      data.map(v => {
        return Math.max(v.fClose, v.fLow, v.fOpen, v.fHigh);
      })
    );

    console.log(min, max);

    priceHeightScale.domain([min, max]);
  };

  const renderSticks = () => {
    const scale = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((value, index) => index))
      .padding(0.3);

    const rectWidth = scale.bandwidth();
    console.log('width:', rectWidth);

    for (let i = 0; i < data.length; i++) {
      context.save();
      let { fOpen, fClose, fLow, fHigh } = data[i];

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

      console.log(x, y, width, height);

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

  renderSticks();
}

export default KlineChart;
