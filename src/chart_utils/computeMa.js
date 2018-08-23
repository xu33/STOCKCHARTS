function computeMa(arr, key, num) {
  for (var i = num - 1; i < arr.length; i++) {
    var item = arr[i];
    var sum = item[key];
    for (var j = i - (num - 1); j < i; j++) {
      sum += arr[j][key];
    }

    arr[i][`ma` + num] = sum / num;
  }

  return arr;
}

export default computeMa;
