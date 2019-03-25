import KlineChart from './canvas_version/KlineChart';
import axios from 'axios';

axios
  .get('/getkline', {
    params: {
      wantNum: 500
    }
  })
  .then(({ data }) => {
    // console.log(data);
    KlineChart(document.getElementById('container'), {
      data: data
    });
  });
