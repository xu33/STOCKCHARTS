import KlineChart from './canvas_version/KlineChart';
import { data } from './canvas_version/data';
KlineChart(document.getElementById('container'), {
  data: data
});
// const element = document.getElementById('container');
// const { width, height } = element.getBoundingClientRect();
// const canvas = document.createElement('canvas');
// canvas.width = width;
// canvas.height = height;
// element.appendChild(canvas);

// const ctx = canvas.getContext('2d');
// ctx.strokeStyle = '#d20';
// ctx.strokeRect(10.5, 10.5, 100, 100);
