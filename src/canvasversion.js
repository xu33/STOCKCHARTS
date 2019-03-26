import KlineChart from './canvas_version/KlineChart';
import { data } from './canvas_version/data';
KlineChart(document.getElementById('container'), {
  data: data
});
