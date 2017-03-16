/**
 * Created by 99171 on 2017/3/16.
 */
const d3 = require('d3')
const getArrayBetween = (startValue, endValue, length) => {
  var interpolater = d3.interpolateNumber(startValue, endValue)
  var result = []
  for (var i = 0; i <= length; i++) {
    result.push(interpolater(i / length))
  }

  return result
}

export default getArrayBetween