const { Board, Pin, Button, Sensor } = require("johnny-five");
const board = new Board({ repl: false }); // REPL disabled

board.on("ready", () => {
  const stepPin = new Pin(3);
  const dirPin = new Pin(4);

  const cwButton = new Button(5);
  const ccwButton = new Button(6);

  const cwLimit = new Sensor.Digital(7);
  const ccwLimit = new Sensor.Digital(8);

  const stepsPerRev = 3200;
  const rpm = 60;
  const stepsPerSecond = (rpm * stepsPerRev) / 60;
  const stepDelay = 1000 / stepsPerSecond;
  const pulseWidth = 1; // 1ms pulse width

  let stepping = false;
  let shouldStop = false;
  let currentDirection = null;
  let stepTimeout = null;
  let pulseTimeout = null;

  let cwPressed = false;
  let ccwPressed = false;

  function resetButtonStates() {
    cwPressed = false;
    ccwPressed = false;
  }

  function isMovementAllowed(direction) {
    if (direction === 1) {
      return !cwLimit.value;
    }
    if (direction === 0) {
      return !ccwLimit.value;
    }
    return false;
  }

  function doStep() {
    // Check if we should stop
    if (!stepping || shouldStop) {
      stopStepping();
      return;
    }

    // Check if movement is still valid
    if (!isMovementAllowed(currentDirection)) {
      console.log('Movement blocked by limit switch');
      stopStepping();
      resetButtonStates();
      return;
    }

    // Check button state
    if ((currentDirection === 1 && !cwPressed) ||
        (currentDirection === 0 && !ccwPressed) ||
        (cwPressed && ccwPressed)) {
      stopStepping();
      return;
    }

    // Generate step pulse
    stepPin.high();
    pulseTimeout = setTimeout(() => {
      stepPin.low();
      
      // Schedule next step only if we should continue
      if (stepping && !shouldStop) {
        stepTimeout = setTimeout(doStep, stepDelay);
      } else {
        stopStepping();
      }
    }, pulseWidth);
  }

  function startStepping(direction) {
    // Don't start if already stepping or both buttons pressed
    if (stepping || (cwPressed && ccwPressed)) {
      return;
    }

    // Check if movement in requested direction is allowed
    if (!isMovementAllowed(direction)) {
      console.log('Movement blocked by limit - not starting');
      resetButtonStates();
      return;
    }

    // Clear any existing timeouts
    stopStepping();

    currentDirection = direction;
    dirPin.write(direction);
    stepping = true;
    shouldStop = false;

    // Start stepping
    doStep();
  }

  function stopStepping() {
    shouldStop = true;
    stepping = false;
    currentDirection = null;

    // Clear timeouts
    if (stepTimeout) {
      clearTimeout(stepTimeout);
      stepTimeout = null;
    }
    if (pulseTimeout) {
      clearTimeout(pulseTimeout);
      pulseTimeout = null;
    }

    // Ensure pins are in safe state
    stepPin.low();
  }

  function updateMotorState() {
    // Only try to start if a single button is pressed
    if (cwPressed && !ccwPressed) {
      startStepping(1);
    } else if (ccwPressed && !cwPressed) {
      startStepping(0);
    } else {
      stopStepping();
    }

    // Log current state for debugging
    console.log('Update motor:', {
      cwPressed,
      ccwPressed,
      cwLimit: cwLimit.value,
      ccwLimit: ccwLimit.value,
      stepping,
      currentDirection
    });
  }

  // Button event handlers
  cwButton.on("down", () => {
    console.log('CW button down');
    cwPressed = true;
    ccwPressed = false; // Ensure other button is not pressed
    updateMotorState();
  });

  cwButton.on("up", () => {
    console.log('CW button up');
    cwPressed = false;
    updateMotorState();
  });

  ccwButton.on("down", () => {
    console.log('CCW button down');
    ccwPressed = true;
    cwPressed = false; // Ensure other button is not pressed
    updateMotorState();
  });

  ccwButton.on("up", () => {
    console.log('CCW button up');
    ccwPressed = false;
    updateMotorState();
  });

  // Monitor limit switches
  cwLimit.on("change", () => {
    console.log('CW limit changed:', cwLimit.value);
    if (cwLimit.value) {
      // If limit is hit, reset button states
      resetButtonStates();
    }
    updateMotorState();
  });

  ccwLimit.on("change", () => {
    console.log('CCW limit changed:', ccwLimit.value);
    if (ccwLimit.value) {
      // If limit is hit, reset button states
      resetButtonStates();
    }
    updateMotorState();
  });

  // Initial state
  stepPin.low();
  dirPin.low();
  resetButtonStates();

  console.log("ready");
});
