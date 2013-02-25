var five = require("johnny-five");

var Lighting = module.exports = function(pubsub) {
  var self = this;

  this.pubsub = pubsub.createClient();

  this.board = new five.Board();
  this.board.on('ready', function() {
    self.initLights();
    self.buildZones();
  });
};

Lighting.prototype.listen = function() {
  var self = this;

  this.pubsub.subscribe('lighting');
  this.pubsub.on('message', function(channel, message) {
    self.controlLights(message);
  });
};

Lighting.prototype.initLights = function() {
  this.LEDS = {
    led1:  new five.Led({ pin: 13 }),
    led2:  new five.Led({ pin: 12 }),
    led3:  new five.Led({ pin: 11 }),
    led4:  new five.Led({ pin: 10 }),
    led5:  new five.Led({ pin: 9 }),
    led6:  new five.Led({ pin: 8 }),
    led7:  new five.Led({ pin: 7 }),
    led8:  new five.Led({ pin: 6 }),
    led9:  new five.Led({ pin: 5 }),
    led10: new five.Led({ pin: 4 })
  };
};

Lighting.prototype.buildZones = function() {
  this.zones = {
    "living room": [this.LEDS.led1, this.LEDS.led2, this.LEDS.led9, this.LEDS.led10],
    "dining room": [this.LEDS.led3, this.LEDS.led4],
    bedroom:       [this.LEDS.led5, this.LEDS.led6],
    study:         [this.LEDS.led7, this.LEDS.led8]
  };
};

/**
 * Toggle lights on/off by zone or all at once
 */

Lighting.prototype.controlLights = function(msg) {
  var self = this,
      data = JSON.parse(msg),
      cmdZone = data.zone,
      zone,
      lights = [];

  if(cmdZone)
    zone = this.zones[cmdZone.toLowerCase()] || null;

  // If a zone add the LEDS in that zone else add all LEDS
  if(zone) {
    lights = zone;
  } else {
    Object.keys(this.LEDS).forEach(function(key) {
      lights.push(self.LEDS[key]);
    });
  }

  this.runCommand(lights, data.command);
};

/**
 * Sends a signal to an array of LEDS
 */

Lighting.prototype.runCommand = function(leds, cmd) {
  leds.forEach(function(led) {
    switch(cmd) {
      case 'on':
        led.on();
        break;
      case 'off':
        led.off();
        break;
    }
  });
};
