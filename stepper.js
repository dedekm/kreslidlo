const { Board, Pin, Button } = require("johnny-five");
const board = new Board({repl: false});

board.on("ready", () => {
  const stepPin = new Pin(11);
  const dirPin = new Pin(12);

  const cwButton = new Button(6);   // Button for CW
  const ccwButton = new Button(8);  // Button for CCW

  const cwLimitButton = new Button(7);
  let cwLimitReached = false;

  const stepsPerRev = 3200;
  const rpm = 60;
  const stepsPerSecond = (rpm * stepsPerRev) / 60;
  const stepDelay = 1000 / stepsPerSecond; // ms

  let stepping = false;

  async function startStepping(direction) {
    if (stepping) return;

    stepping = true;
    dirPin.write(direction); // 1 = CW, 0 = CCW

    while (stepping) {
      const start = process.hrtime.bigint();

      stepPin.high();
      await new Promise((r) => setTimeout(r, 1)); // Pulse width ~1ms
      stepPin.low();

      const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
      const delay = Math.max(0, stepDelay - elapsed);

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  function stopStepping() {
    stepping = false;
  }

  cwButton.on("press", () => {
    if (cwLimitReached) return
    startStepping(1)
  });
  ccwButton.on("press", () => startStepping(0));

  cwButton.on("release", stopStepping);
  ccwButton.on("release", stopStepping);

  cwLimitButton.on("press", () => {
    stepping = false
    cwLimitReached = true
  });

  cwLimitButton.on("release", () => {
    cwLimitReached = false
  });
});
