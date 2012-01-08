(function () {
	var context;

	function createCanvas(width, height, node) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		if (node && node.appendChild) {
			node.appendChild(canvas);
		}

		return canvas.getContext('2d');
	}

	context = createCanvas(800, 600, document.body);
}());
