(function () {
	var context, app;

	function createCanvas(width, height, node) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		if (node && node.appendChild) {
			node.appendChild(canvas);
		}

		['mouseMove', 'mouseDown', 'mouseUp'].forEach(function (event) {
			canvas.addEventListener(event.toLowerCase(), function (e) {
				var x, y;
				x = e.offsetX;
				y = e.offsetY;

				if (typeof x === 'undefined' || typeof y === 'undefined') {
					x = e.pageX - canvas.offsetLeft;
					y = e.pageY - canvas.offsetTop;
				}

				app[event].apply(app, [x, y, e]);
				update();
			}, false);
		});

		return canvas.getContext('2d');
	}

	function update() {}

	context = createCanvas(800, 600, document.body);

	app = (function () {
		var mouse;

		mouse = {
			x: -1,
			y: -1,
			isDown: false
		};

		return {
			mouseMove: function (x, y) {
				mouse.x = x;
				mouse.y = y;
				console.log(mouse.x, mouse.y, mouse.isDown);
			},

			mouseDown: function (x, y) {
				mouse.x = x;
				mouse.y = y;
				mouse.isDown = true;
			},

			mouseUp: function (x, y) {
				mouse.x = x;
				mouse.y = y;
				mouse.isDown = false;
			}
		};
	}());
}());
