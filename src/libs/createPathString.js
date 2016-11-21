var createPathString = function(...points) {
	var pathString = `M${points[0].x},${points[0].y}`

	for (var i = 1; i < points.length; i++) {
		pathString += `L${points[i].x},${points[i].y}`
	}

	return pathString
}

module.exports = createPathString