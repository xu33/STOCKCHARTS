/**
 * Created by shinan on 2016/12/6.
 */

const UnitUtil = {
  millionBillion: function(n) {
    var a = [[1e4, '万'], [1e8, '亿']]

    for (var i = a.length - 1; i >= 0; i--) {
      let [size, unit] = a[i]

      if (n > size) {
        let ret = (n / size).toFixed(2)

        if (i == 0) {
          ret = parseInt(ret)
        }

        return ret + unit
      }
    }

    return n
  },
  million: function(n) {
    let ret = parseInt(n / 1e4)

    return `${ret}万`
  }
}

module.exports = UnitUtil
