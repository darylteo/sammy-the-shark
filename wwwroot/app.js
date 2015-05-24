(function($) {
	$('.throttle-controls').each(function() {
		var self = this;
		var ws;

		var orientation = {
			alpha: 0,
			beta: 0,
			gamma: 0
		};

		var speed = 0;
		var mood = 0;

		var connected = false;
		
		var startTime = null;
		var endTime = null;

		var downY = -1;

		var resetTimer = function() {
			startTime = null;
			endTime = null;
		}

		var throttleChange = function(e) {
			if(startTime != null) {
				startTime = new Date();
			}

			var change = e.pageY - downY;
			downY = e.pageY;
			speed -= change;
			speed = Math.min(Math.max(speed, 0), 255);

			$('.throttle > h1').text(speed);

			e.preventDefault();
		}

		var trackThrottle = function(e) {	
			var enabled = e.type === 'mousedown' || e.type === 'touchstart';

			if(enabled) {
				downY = e.pageY;
				self.addEventListener('mousemove', throttleChange);
			} else {
				downY = -1;
				self.removeEventListener('mousemove', throttleChange);
			}
		}

		var connect = function() {
			if(ws) {
				return; 
			}

			ws = new WebSocket('ws://' + window.location.hostname + ':8081/sammy');
			ws.onopen = function() {
				connected = true;
			}
			ws.onclose = function() {
				connected = false;
				ws = null;

				setTimeout(connect, 1000);
			}
			ws.onerror = function() {
				connected = false;
				ws = null;

				setTimeout(connect, 1000);
			}
		}

		window.addEventListener('deviceorientation', function(e){
			orientation = e;
		});

		this.addEventListener('touchmove', throttleChange);

		this.addEventListener('touchstart', trackThrottle);
		this.addEventListener('touchstop', trackThrottle);
		this.addEventListener('mousedown', trackThrottle);
		this.addEventListener('mouseup', trackThrottle);

		$('html,body').on('touchmove,touchstart, touchstop, mousedown, mouseup, mousemove', function(e) {
			e.preventDefault();
		})

		setInterval(function(){
			if(ws && connected) {
				var payload = orientation.beta + ':' + speed + ':' + mood;
				ws.send(payload);
			} else {
				setTimeout(connect, 100);
			}

			$('.debug').html('<p>' + payload + '</p><p>' + (ws ? (connected ? 'connected' : 'connecting') : 'disconnected') + '</p>');
		}, 100);

		$('.debug').append('<p>Debugging</p>');
	});
})(jQuery);