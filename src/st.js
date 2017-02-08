var data = require('./fake_data/normalizeData')
var moment = require('moment')

require(['./StockChart'], (StockChart) => {
  let candleData = data.map(item => ({
    ...item,
    time: moment( new Date(item.time) ).format('YYYY-MM-DD')
  }))

  new StockChart(document.querySelector('#container'), {
    candleData: [...candleData],
    width: 600,
    height: 300,
    volume: true,
    interactive: true
  })
})
