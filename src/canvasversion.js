// import KlineChart from './canvas_version/KlineChart';
// import axios from 'axios';

// axios
//   .get('/getkline', {
//     params: {
//       wantNum: 500
//     }
//   })
//   .then(({ data }) => {
//     // console.log(data);
//     KlineChart(document.getElementById('container'), {
//       data: data
//     });
//   });

const canvas = document.createElement('canvas');
document.getElementById('container').appendChild(canvas);
canvas.width = 300;
canvas.height = 300;
const context = canvas.getContext('2d');
// context.globalCompositeOperation = 'source-atop';
context.beginPath();
context.moveTo(20, 20);
context.lineTo(50, 120);
context.stroke();
context.closePath();

context.rect(10, 10, 100, 100);
context.lineCap = 'butt';
context.fillStyle = '#eee';
context.stroke();
context.fill();
