const five = require("johnny-five");

const board = new five.Board({ repl: false });

const buttonsPressed = {
  right: false,
  left: false
}

board.on("ready", function() {
  var led = new five.Led(13);

  var buttonRight = new five.Button(5);
  var buttonLeft = new five.Button(6);

  buttonRight.on("press", function() {
    console.log('buttonRight pressed')
    buttonsPressed.right = true
    led.on()
  });

  buttonRight.on("release", function() {
    console.log('buttonRight releaseed')
    buttonsPressed.right = false
    led.off()
  });

  buttonLeft.on("press", function() {
    console.log('buttonLeft pressed')
    buttonsPressed.left = true
    led.on()
  });

  buttonLeft.on("release", function() {
    console.log('buttonLeft releaseed')
    buttonsPressed.left = false
    led.off()
  });

  console.log('ready');
});
