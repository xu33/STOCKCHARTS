module.exports = function(stock) {
	var keys = ['low', 'high', 'open', 'close']

	keys.forEach(function(key) {
		stock[key] = +stock[key]
	})

	return stock
}