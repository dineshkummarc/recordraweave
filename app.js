(function (window, document, $) {
	var context, app, width, height, lastUpdate;

	repaint = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(function () {
				callback(Date.now());
			}, 20);
		};

	function update(time, force) {
		repaint(update);
		var delta = time - lastUpdate;
		if (delta >= 16 || force) { // Cap at 60 FPS
			lastUpdate = time;

			app.update(delta);
			app.render(context);
		}
	}

	function initEvents() {
		var canvas = context.canvas;

		$(canvas).bind('mousemove mousedown mouseup', function (event) {
			var x, y;
			x = event.offsetX;
			y = event.offsetY;

			if (typeof x === 'undefined' || typeof y === 'undefined') {
				x = event.pageX - canvas.offsetLeft;
				y = event.pageY - canvas.offsetTop;
			}

			app[event.type].apply(app, [x, y, event]);
			update();

			event.preventDefault();
			return false;
		});

		$('#menu li').click(function (event) {
			var func, self = $(this);

			if (self.hasClass('selected')) {
				return;
			}

			$('#menu li').removeClass('selected');
			self.addClass('selected');

			func = self.attr('id');
			if (typeof app[func] === 'function') {
				return app[func].apply(app, [event]);
			}
		});
	}

	function init() {
		var canvas;

		width = 800;
		height = 600;

		canvas = $('<canvas/>')[0];
		canvas.width = width;
		canvas.height = height;
		$('#canvas').append(canvas);
		context = canvas.getContext('2d');
		context.font = '26px calibri, helvetica, serif';
		context.textAlign = 'center';

		initEvents();

		lastUpdate = Date.now();
		update(lastUpdate);
	}

	function Path(input) {
		if (typeof input === 'undefined') {
			this.path = [];
		} else {
			this.deserialize(input);
		}
	}

	Path.prototype.addPoint = function (x, y) {
		var tail, distance;

		if (this.path.length) {
			tail = this.path.slice(-1)[0];
			if (x === tail.x && y === tail.y) {
				return false;
			}

			distance = Math.sqrt(
				Math.pow(x - tail.x, 2),
				Math.pow(y - tail.y, 2)				
			);

			if (distance < 3) {
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

		return this.path = matches.map(function (n) {
			return ({
				x: parseInt(n.slice(0, 3), 16),
				y: parseInt(n.slice(3), 16)
			});
		});
	};

	Path.prototype.render = function (ctx, length) {
		var j, xc, yc, len = length || this.path.length;

		if (this.path.length > 2 && len > 2) {
			ctx.beginPath();
			ctx.moveTo(this.path[0].x, this.path[0].y);

			for (j = 1; j < len - 2; j += 1) {
				xc = (this.path[j].x + this.path[j + 1].x) / 2;
				yc = (this.path[j].y + this.path[j + 1].y) / 2;
				ctx.quadraticCurveTo(this.path[j].x, this.path[j].y, xc, yc);
			}

			ctx.quadraticCurveTo(
				this.path[j].x,
				this.path[j].y,
				this.path[j + 1].x,
				this.path[j + 1].y
			);

			ctx.stroke();
		}
	};

	app = (function () {
		var mouse, path, len, states = {}, state;

		mouse = {
			x: -1,
			y: -1,
			isDown: false
		};

		path = new Path();

		state = 'record';
		states.record = {
			update: function (delta) {
				if (path.path.length) {
					len = (len + .15 * delta) % path.path.length;
				}
			},

			render: function (ctx) {
				ctx.lineWidth = 2.0;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#000';

				if (!mouse.isDown) {
					ctx.clearRect(0, 0, width, height);
					path.render(ctx, Math.floor(len));
				} else if (mouse.x >= 0 && mouse.y >= 0) {
					ctx.fillRect(mouse.x, mouse.y, 2, 2);
				}
			}
		};

		states.save = {
			update: function () {},

			render: function (ctx) {
				ctx.clearRect(0, 0, width, height);
				ctx.fillStyle = '#000';
				ctx.fillText(
					'Your drawing was saved. Maybe.',
					width / 2,
					height / 2
				);
			}
		};

		states.gallery = {
			update: function () {},

			render: function (ctx) {
				ctx.clearRect(0, 0, width, height);
				ctx.fillStyle = '#000';
				ctx.fillText(
					'Draw a gallery of saved drawings here',
					width / 2,
					height / 2
				);
			}
		};

		return ({
			mousemove: function (x, y) {
				mouse.x = x;
				mouse.y = y;

				if (mouse.isDown && state === 'record') {
					path.addPoint(x, y);
				}
			},

			mousedown: function (x, y) {
				mouse.x = x;
				mouse.y = y;
				mouse.isDown = true;
			},

			mouseup: function (x, y) {
				mouse.x = x;
				mouse.y = y;
				mouse.isDown = false;
				len = 0;

				app.render(context);
			},

			record: function (event) {
				state = 'record';
			},

			save: function (event) {
				path = new Path();
				state = 'save';
			},

			showGallery: function (event) {
				state = 'gallery';
			},

			render: function (ctx) {
				states[state].render(ctx);
			},

			update: function (delta) {
				states[state].update(delta);
			}
		});
	}());

	init();
}(this, this.document, this.jQuery));
