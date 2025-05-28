const five = require("johnny-five");

const board = new five.Board({ repl: false });

const buttonsPressed = {
  right: false,
  left: false,
  rightLimit: false,
  leftLimit: false
}

board.on("ready", function() {
  var led = new five.Led(13);

  var buttonRight = new five.Button(2);
  var buttonLeft = new five.Button(3);


  var buttonRightLimit = new five.Button({
    pin: 4,
    isPullup: true
  });
  var buttonLeftLimit = new five.Button({
    pin: 5,
    isPullup: true
  });


  buttonRight.on("press", function() {
    console.log('buttonRight pressed')
    buttonsPressed.right = true
    led.on()
  });

  buttonRight.on("release", function() {
    console.log('buttonRight released')
    buttonsPressed.right = false
    led.off()
  });

  buttonLeft.on("press", function() {
    console.log('buttonLeft pressed')
    buttonsPressed.left = true
    led.on()
  });

  buttonLeft.on("release", function() {
    console.log('buttonLeft released')
    buttonsPressed.left = false
    led.off()
  });

  buttonRightLimit.on("press", function() {
    console.log('buttonRightLimit pressed')
    buttonsPressed.rightLimit = true
    led.on()
  });

  buttonRightLimit.on("release", function() {
    console.log('buttonRightLimit released')
    buttonsPressed.rightLimit = false
    led.off()
  });

  buttonLeftLimit.on("press", function() {
    console.log('buttonLeftLimit pressed')
    buttonsPressed.leftLimit = true
    led.on()
  });

  buttonLeftLimit.on("release", function() {
    console.log('buttonLeftLimit released')
    buttonsPressed.leftLimit = false
    led.off()
  });

  console.log('ready');
});
