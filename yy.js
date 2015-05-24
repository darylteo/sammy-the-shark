var five = require('johnny-five');
var Spark = require('spark-io');
var express = require('express');

var WebSocketServer = require('ws').Server;

// setup 
var app = express();

app.use(express.static('wwwroot'));
app.listen(55555);

var state = {
  sammyConected: false,
  playerConnected :false,

  l: null,
  r: null,
  led: null
}

connect();

var wss = new WebSocketServer({ port: 8081 });
wss.on('connection', function(ws) {
  if(!state.playerConnected) {
    state.playerConnected = true;

    ws.on('message', function(message){
      if(!state.playerConnected) {
        return;
      }

      console.log('message: ' + message);
      var parts = message.split(':');

      var angle = parseFloat(parts[0]);
      var speed = parseInt(parts[1]);
      var mood = parseInt(parts[2]);

      var rBias = 1.0;
      var lBias = 1.0;

      var max = 65;
      if(angle < 0) {
        rBias = (max + angle) / max;
      } else {
        lBias = (max - angle) / max;
      }

      if(state.l && state.r) {
        if(speed > 0) {
          // r to turn left
          // l to turn right
          state.r.start(Math.max(lBias * speed, 30));
          state.l.start(Math.max(rBias * speed, 30));
        } else {
          state.r.stop();
          state.l.stop();
        }
      }

      // if(mood === 1) {
      //   state.gEyes.on();
      //   state.rEyes.off();
      // } else if (mood === 2) {
      //   state.gEyes.off();
      //   state.rEyes.on();
      // } else if(mood === 0) {
      //   state.gEyes.off();
      //   state.rEyes.off();
      // } else {
      //   state.rEyes.blink();
      // }
    })
    .on('close', function() {
      state.playedConnected = false;
    })
    .on('error', function(e) {
      console.log(e);
      ws = null;
    });

    var ping = function() {
      if(ws) {
        try {
          ws.send('ping');
          setTimeout(ping);
        } catch(e) {
          ws.close();
          console.log(e);
          state.playerConnected = false;
        }
      } else {
        state.playerConnected = false;
      }
    };

    setTimeout(ping,500);
  } else {
    ws.close();
    state.playerConnected = false;
  }
});
wss.on('error', function(e) {
  console.log(e);
});

state.board.on('ready', function() {
  var l = new five.Motor({
    pin: 'A1'
  });

  var r = new five.Motor({
    pin: 'A0'
  });

  var led = new five.Led({
    pin: 'D7'
  });
  led.off();

  var gEyes = new five.Led({
    pin: 'D5'
  });

  var rEyes = new five.Led({
    pin: 'D3'
  });

  gEyes.off();
  rEyes.off();

  state.l = l;
  state.r = r;
  state.led = led;
  state.gEyes = gEyes;
  state.rEyes = rEyes;

  state.board.repl.inject({
    led: led,

    l: l,
    r: r,

    gEyes: gEyes,
    rEyes: rEyes
  });

  state.board.on('close', function() {
    led.off();
    l.stop();
    r.stop();    
    gEyes.off();
    rEyes.off();
  });
});

function setThrottle(speed, lt, rt) {
  lt.start(speed);
  rt.start(speed);
}

function connect() {
  state.board = new five.Board({
    io: new Spark({
      token: process.env.ACCESS_TOKEN,
      deviceId: 'process.env.DEVICE_ID',
      cloudAddress: 'http://localhost:8080'
    }).on('error', function(e) {
      console.log(e);
      setTimeout(connect, 1000);
    })
  });
};