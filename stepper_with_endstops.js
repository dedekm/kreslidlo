const { Board, Pin, Button, Sensor } = require("johnny-five");
const board = new Board({ repl: false });

board.on("ready", () => {
  const stepPin = new Pin(3);
  const dirPin = new Pin(4);

  const cwButton = new Button(5);
  const ccwButton = new Button(6);

  const cwLimit = new Sensor.Digital(7);
  const ccwLimit = new Sensor.Digital(8);

  const stepsPerRev = 3200;
  const rpm = 100;
  const stepsPerSecond = (rpm * stepsPerRev) / 60;
  const stepDelay = 1000 / stepsPerSecond;

  let stepping = false;
  let currentDirection = null;

  let cwPressed = false;
  let ccwPressed = false;

  async function startStepping(direction) {
    if (stepping) return;

    // Block if both buttons are pressed
    if (cwPressed && ccwPressed) {
      console.log("Both buttons pressed — motor blocked.");
      return;
    }

    // Block if the matching limit switch is hit
    if ((direction === 1 && cwLimit.value === 1) ||
        (direction === 0 && ccwLimit.value === 1)) {
      console.log("Limit switch active — cannot move.");
      return;
    }

    stepping = true;
    currentDirection = direction;
    dirPin.write(direction);

    while (stepping) {
      // Stop if both buttons are pressed
      if (cwPressed && ccwPressed) {
        console.log("Both buttons pressed during motion — stopping.");
        stopStepping();
        return;
      }

      // Stop if limit is hit
      if ((direction === 1 && cwLimit.value === 1) ||
          (direction === 0 && ccwLimit.value === 1)) {
        console.log("Limit switch triggered — stopping.");
        stopStepping();
        return;
      }

      const start = process.hrtime.bigint();

      stepPin.high();
      await new Promise(r => setTimeout(r, 1));
      stepPin.low();

      const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
      const delay = Math.max(0, stepDelay - elapsed);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  function stopStepping() {
    stepping = false;
    currentDirection = null;
  }

  // CW button events
  cwButton.on("press", () => {
    cwPressed = true;
    if (!ccwPressed) startStepping(1);
  });
  cwButton.on("release", () => {
    cwPressed = false;
    stopStepping();
  });

  // CCW button events
  ccwButton.on("press", () => {
    ccwPressed = true;
    if (!cwPressed) startStepping(0);
  });
  ccwButton.on("release", () => {
    ccwPressed = false;
    stopStepping();
  });

  console.log("kreslidlo ready")
});
