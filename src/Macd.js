/**
 * Created by 99171 on 2017/2/9.
 */
const d3 = require('d3')

class Macd {
  constructor(selector, options) {
    this.options = options
    this.element = d3.select(selector).append('div')
    this.svg = this.element.append('svg').attr('width', this.options.width).attr('height', 100)
  }

  render() {
    var { candleData, width } = this.options
    // var scaleX =
  }

  update() {

  }
}

module.exports = Macd