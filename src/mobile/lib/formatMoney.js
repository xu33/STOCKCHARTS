/**
 * Created by 99171 on 2017/3/27.
 */
module.exports = function(n) {
  var a = [[1e4, '万'], [1e8, '亿']]

  for (var i = a.length - 1; i >= 0; i--) {
    let [size, unit] = a[i]

    if (n > size) {
      let ret = (n / size).toFixed(2)

      // if (i == 0) {
      //   ret = parseInt(ret)
      // }

      return ret + unit
    }
  }

  return n
}