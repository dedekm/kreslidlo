const five = require("johnny-five");

const board = new five.Board({ repl: false });

const buttonsPressed = {
  right: false,
  left: false
}

board.on("ready", function() {
  // // Create an Led on pin 9
  // var led = new five.Led(9);

  // // Strobe the pin on/off, defaults to 100ms phases
  // led.strobe();

  // board.on("exit", () => {
  //   led.off();
  // });

  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 3600,
    // pins: [2, 3],
    pins: {
        dir: 4,
        step: 3
      }
  });


  var stepperStep = new five.Pin({
    pin: 11
  });
  var stepperDirection = new five.Pin({
    pin: 12
  });

  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  // const sensor = new five.Sensor("A0");



  // const buttons = {
  //   right: { value: 510, pressed: false }, // hnedy, cerny, cerny, zlutohnedy, hnedy
  //   left: { value: 990, pressed: false } // hnedy, cerny, cerny, cerveny, hnedy
  // }

  // sensor.on("change", value => {
  //   for (var key in buttons) {
  //     let buttonValue = buttons[key].value
  //     buttons[key].pressed = value > buttonValue - 10 && value < buttonValue + 10
  //   }
  //   console.log(value)
  //   console.log(buttons)
  // });

  const buttonsPressed = {
    right: false,
    left: false
  }

  // var buttonRight = new five.Button(7);
  // var buttonLeft = new five.Button(6);

  // buttonRight.on("press", function() {
  //   console.log('buttonRight.on("press')
  //   buttonsPressed.right = true
  // });

  // buttonRight.on("release", function() {
  //   console.log('buttonRight.on("release')
  //   buttonsPressed.right = false
  // });

  // buttonLeft.on("press", function() {
  //   console.log('buttonLeft.on("press",')
  //   buttonsPressed.left = true
  // });

  // buttonLeft.on("release", function() {
  //   console.log('buttonLeft.on("release",')
  //   buttonsPressed.left = false
  // });

  // board.loop(10, () => {
  //   if (buttonsPressed.right && buttonsPressed.left) {
  //     // both pressed => zero movement
  //   } else {
  //     if (buttonsPressed.right) {
  //       console.log('step CW')
  //       stepperDirection.low()
  //       stepperStep.high()
  //       board.wait(5, function() {
  //         stepperStep.low()
  //       })

  //       // stepper.step({ steps: 1, direction: 1 }, () => {});
  //     }
  //     if (buttonsPressed.left) {
  //       stepperDirection.high()
  //       stepperStep.high()
  //       board.wait(5, function() {
  //         stepperStep.low()
  //       })
  //       // stepper.step({ steps: 1, direction: 0 }, () => {});
  //     }
  //   }
  // });

  console.log("ready");

  // Set stepper to 180 RPM, counter-clockwise with acceleration and deceleration
  stepper.rpm(30).cw()

  var direction = 1;
  function runStepper() {
    stepper.direction(direction).step(3600, () => {
      console.log("Stop");

      board.wait(1000, function() {
        console.log("Go =>", direction);
        runStepper();

        if (direction == 1) {
          direction = 0;
        } else {
          direction = 1;
        }
      });

    });
  }
  runStepper();
});
