(function () {
	var context, app, width, height;

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

	width = 800;
	height = 600;
	context = createCanvas(width, height, document.body);

	function Path(input) {
		if (typeof input === 'undefined') {
			this.path = [];
		} else {
			this.deserialize(input);
		}
	}

	Path.prototype.addPoint = function (x, y) {
		var tail;

		if (this.path.length) {
			tail = this.path.slice(-1);
			if (x === tail.x && y === tail.y) {
				return false;
			}
		}

		return this.path.push({ x: +x, y: +y });
	};

	Path.prototype.serialize = function () {
		return this.path.map(function (point) {
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

	Path.prototype.deserialize = function (input) {
		var matches = input.match(/[0-9a-f]{6}/g);

		if (!matches) {
			return false;
		}

		this.path = matches.map(function (n) {
			return ({
				x: parseInt(n.slice(0, 3), 16),
				y: parseInt(n.slice(3), 16)
			});
		});
	};

	Path.prototype.render = function (ctx) {
		if (this.path.length) {
			ctx.beginPath();
			ctx.moveTo(this.path[0].x, this.path[0].y);

			for (j = 1; j < this.path.length; j += 1) {
				ctx.lineTo(this.path[j].x, this.path[j].y);
			}

			ctx.stroke();
		}
	};

	app = (function () {
		var mouse, path;

		mouse = {
			x: -1,
			y: -1,
			isDown: false
		};

		path = new Path();

		function render(ctx) {
			var j;

			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = '#000';
			path.render(ctx);
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
