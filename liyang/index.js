window.onload = function () {
  let huiceData = _data1;
  let initialData = huiceData.slice(0, 100);

  let chart = new LineChart(document.getElementById('target'), {
    data: initialData,
    containerWidth: 400,
    containerHeight: 200,
    tooltip: function (dataItem) {
      return `<code>${JSON.stringify(dataItem)}</code>`
    }
  })

  // 更新
  setTimeout(function () {
    chart.addData(huiceData.slice(101, 200));
  }, 1000);
}
