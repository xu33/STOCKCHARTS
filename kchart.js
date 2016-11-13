// var paper = new Raphael(document.getElementById('container'), 650, 400, 0, 0)
var candleWidth = 5
var chartlist = data.chartlist

chartlist = chartlist.slice(chartlist.length - 70, chartlist.length - 1)
var first = chartlist[0]
var last = chartlist[chartlist.length - 1]

var x = d3.scaleTime().domain([new Date(first.time), new Date(last.time)]).range([0, 5])

var xs = []

for (var i = 0; i < 5; i++) {
  var o = new Date(x.invert(i))
  var year = o.getFullYear()
  var month = o.getMonth()
  var day = o.getDate()

  xs.push(
    [year, month, day].join('/')
  )  
}

var high = chartlist.reduce(function(prev, curr) {
  if (curr.high > prev) {
    return curr.high
  }

  return prev
}, 0)

var low = chartlist.reduce((prev, curr) => {
  if (curr.low < prev) {
    return curr.low
  }

  return prev
}, chartlist[0].low)

console.log(high, low)

var chartWidth = 1400
var chartHeight = 800

var y = d3.scaleLinear().domain([low, high]).range([0, chartHeight])
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
var prefix = 0.5

var Chart = function() {

}

console.log(xs)

var fontSize = 24

Chart.prototype = {
  draw: function() {
    ctx.save()
    ctx.translate(0.5, 0.5)
    // ctx.scale(0.5, 0.5)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#555'
    // draw y
    ctx.moveTo(0, 0)
    ctx.lineTo(0, chartHeight)
    ctx.stroke()
    // draw x
    ctx.lineTo(chartWidth, chartHeight)
    ctx.stroke()

    // console.log(this.drawKedu)
    this.drawKedu()


    console.log(chartlist)

    this.drawCandle()
  },
  drawKedu: function() {
    ctx.strokeStyle = '#999'
    
    
    // x kedu
    var keduX = d3.scaleLinear([0, chartWidth]).domain([0, 4]).range([0, chartWidth])
    for (var i = 0; i < xs.length; i++) {
      var x = keduX(i)
      var y = chartHeight
      
      // 画辅助线

      if (i > 0) {
        ctx.moveTo(x, y)
        ctx.lineTo(x, 0)
        ctx.stroke()
      }
      
      y += fontSize
      if (i === xs.length - 1) {
        var o = ctx.measureText(xs[i])
        var textWidth = o.width
        x = x - textWidth
      }

      ctx.fillText(xs[i], x, y) 
    }

    // y dedu
    var steps = 3
    var prices = d3.scaleLinear().domain([low, high]).range([0, steps])
    var keduY = d3.scaleLinear().domain([low, high]).range([chartHeight, 0])

    for (var i = 0; i <= steps; i++) {
      var txt = prices.invert(i).toFixed(2)
      var x = 0
      var y = keduY(txt)

      x = parseInt(x)
      y = parseInt(y)

      if (i > 0) {
        ctx.moveTo(0, y)
        ctx.lineTo(chartWidth, y)
        ctx.stroke()
      }

      if (y === 0) {
        y = y + fontSize
      }

      ctx.fillText(txt, x, y)
    }
  },
  drawCandle: function() {
    var marginLeft = this.marginLeft = 5
    var marginRight = this.marginRight = 5
    var candleMargin = 4
    var total = chartlist.length

    var candleWidth = (chartWidth - marginLeft - marginRight - candleMargin * (total - 1)) / total

    var linearY = d3.scaleLinear().domain([low, high]).range([chartHeight, 0])
    var linearX = d3.scaleLinear().domain([0, total]).range([0, chartWidth])  

    for (var i = 0; i < total; i++) {
      var item = chartlist[i]
      var { open, close } = item
      var color = open > close ? '#33aa11' : '#dd2200'
      let {low , high} = item 

      if (open > close) {
        y1 = linearY(open)
        x1 = linearX(i)

        y2 = linearY(close)

        x1 = parseInt(x1)
        y1 = parseInt(y1)
        y2 = parseInt(y2)

        this.drawEachCandle(x1, y1, candleWidth, y2 - y1, color)    
      } else {
        y1 = linearY(close)
        x1 = linearX(i)

        y2 = linearY(open)

        x1 = parseInt(x1)
        y1 = parseInt(y1)
        y2 = parseInt(y2)

        this.drawEachCandle(x1, y1, candleWidth, y2 - y1, color) 
      }

      x1 = linearX(i) + (candleWidth >> 1)
      y1 = linearY(high)
      y2 = linearY(low)

      ctx.moveTo(x1 + marginLeft, y1)
      ctx.lineTo(x1 + marginLeft, y2)
      ctx.strokeStyle = color
      ctx.stroke()
    }      
  },
  drawEachCandle: function(x, y, width, height, color) {
    x = x + this.marginRight
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.rect(x, y, width, height)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }
}

var chartInstance = new Chart()

chartInstance.draw()