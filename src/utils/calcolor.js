function calColor(d) {
  if (d.close > d.open) {
    return CandleStickMain.colors.WIN_COLOR;
  } else if (d.close < d.open) {
    return CandleStickMain.colors.LOSS_COLOR;
  } else {
    return CandleStickMain.colors.EQUAL_COLOR;
  }
}

module.exports = calColor;
