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
		var mouse, path;

		mouse = {
			x: -1,
			y: -1,
			isDown: false
		};

		path = [];

		path.addPoint = function (x, y) {
			var tail;

			if (path.length) {
				tail = path.slice(-1);
				if (x === tail.x && y === y) {
					return false;
				}
			}

			return path.push({ x: +x, y: +y });
		};

		path.serialize = function () {
			return path.map(function (point) {
				return [point.x, point.y].join(',');
			})
			.join(',')
			.split(',')
			.map(function (n) {
				var convert = (+n).toString(16);
				while (convert.length < 3) {
					convert = '0' + convert;
				}

				return convert;
			})
			.join('');
		};

		path.deserialize = function (input) {
			return input.match(/[\d\w]{6}/g).map(function (n) {
				return ({
					x: parseInt(n.slice(0, 3), 16),
					y: parseInt(n.slice(3), 16)
				})
			});
		}

		function render(ctx) {
			var j;

			ctx.strokeStyle = '#000';

			if (path.length) {
				ctx.beginPath();
				ctx.moveTo(path[0].x, path[0].y);

				for (j = 1; j < path.length; j += 1) {
					ctx.lineTo(path[j].x, path[j].y);
				}

				ctx.stroke();
			}
		}

		return ({
			mouseMove: function (x, y) {
				mouse.x = x;
				mouse.y = y;

				if (mouse.isDown) {
					path.addPoint(x, y);
				}
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

				render(context);
			},

			render: render
		});
	}());
}());
