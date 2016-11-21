const pixelFix = 0.5

const px = function(value) {
	value = Math.floor(value)
	return value + pixelFix
}

module.exports = px