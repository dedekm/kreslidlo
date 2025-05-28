const five = require("johnny-five");

const board = new five.Board({ repl: false });

const buttonsPressed = {
  right: false,
  left: false
}

const endstopsPressed = {
  right: false,
  left: false
}

board.on("ready", function() {
  const stepsPerRev = 200;
  const microSteps = 16;
  const microStepsPerRev = stepsPerRev * microSteps;
  const smallStepAmount = Math.floor(microStepsPerRev / 100); // Move 1/100th of a revolution

  // Initialize control buttons
  const buttonRight = new five.Button(2);
  const buttonLeft = new five.Button(3);

  // Initialize endstop buttons with pull-up resistors
  const endstopRight = new five.Button({
    pin: 4,
    isPullup: true
  });
  const endstopLeft = new five.Button({
    pin: 5,
    isPullup: true
  });

  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: microStepsPerRev,
    // pins: [2, 3],
    pins: {
        dir: 12,
        step: 11
      }
  });

  console.log("ready");

  // Set initial speed
  stepper.rpm(60);

  // Control button event handlers
  buttonRight.on("down", function() {
    buttonsPressed.right = true;
    checkAndMove();
  });

  buttonRight.on("up", function() {
    buttonsPressed.right = false;
    checkAndMove();
  });

  buttonLeft.on("down", function() {
    buttonsPressed.left = true;
    checkAndMove();
  });

  buttonLeft.on("up", function() {
    buttonsPressed.left = false;
    checkAndMove();
  });

  // Endstop button event handlers
  endstopRight.on("down", function() {
    endstopsPressed.right = true;
    console.log("Right endstop triggered");
  });

  endstopRight.on("up", function() {
    endstopsPressed.right = false;
    console.log("Right endstop released");
  });

  endstopLeft.on("down", function() {
    endstopsPressed.left = true;
    console.log("Left endstop triggered");
  });

  endstopLeft.on("up", function() {
    endstopsPressed.left = false;
    console.log("Left endstop released");
  });

  function checkAndMove() {
    // If both buttons are pressed, don't move
    if (buttonsPressed.right && buttonsPressed.left) {
      console.log("Both buttons pressed - stopping");
      return;
    }

    if (!stepper.isMoving) {
      if (buttonsPressed.right && !endstopsPressed.right) {
        stepper.cw().step(smallStepAmount, () => {
          console.log("Step CW complete");
          checkAndMove(); // Check if we should continue moving
        });
      } else if (buttonsPressed.left && !endstopsPressed.left) {
        stepper.ccw().step(smallStepAmount, () => {
          console.log("Step CCW complete");
          checkAndMove(); // Check if we should continue moving
        });
      }
    }
  }
});
