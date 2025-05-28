const five = require("johnny-five");

const board = new five.Board({ repl: false });

class Motor {
  constructor(board, forwardPin, reversePin, speed) {
    this.board = board;
    this.forwardPin = forwardPin;
    this.reversePin = reversePin;
    this.speed = speed;
    this.initialize();
  }

  initialize() {
    this.board.pinMode(this.forwardPin, five.Pin.PWM);
    this.board.pinMode(this.reversePin, five.Pin.PWM);
  }

  up() {
    this.stop();
    this.board.analogWrite(this.forwardPin, this.speed);
    this.board.analogWrite(this.reversePin, 0);
  }

  down() {
    this.stop();
    this.board.analogWrite(this.forwardPin, 0);
    this.board.analogWrite(this.reversePin, this.speed);
  }

  stop() {
    this.board.analogWrite(this.forwardPin, 0);
    this.board.analogWrite(this.reversePin, 0);
  }

  setSpeed(newSpeed) {
    this.speed = Math.min(Math.max(newSpeed, 0), 255);
  }
}

board.on("ready", () => {
  const yMotor = new Motor(board, 9, 10, 80);
    
  const state = {
    yUp: false,
    yDown: false,
    yTopLimit: false,    // top endstop
    yBottomLimit: false  // bottom endstop
  };

  function updateMotorState() {
    // both pressed or neither pressed = stop
    if ((state.yUp && state.yDown) || (!state.yUp && !state.yDown)) {
      yMotor.stop();
      return;
    }

    // only up pressed
    if (state.yUp) {
      // allow up movement if top limit is not reached
      if (!state.yTopLimit) {
        console.log("Motor going up");
        yMotor.up();
      } else {
        yMotor.stop();
      }
      return;
    }

    // only down pressed
    if (state.yDown) {
      // allow down movement if bottom limit is not reached
      if (!state.yBottomLimit) {
        console.log("Motor going down");
        yMotor.down();
      } else {
        yMotor.stop();
      }
      return;
    }
  }

  // initialize buttons
  const yUpButton = new five.Button({
    pin: 2,
    debounce: 20
  });

  const yDownButton = new five.Button({
    pin: 3,
    debounce: 20
  });

  // initialize endstops (normally closed switches)
  const yTopEndstop = new five.Button({
    pin: 4,
    isPullup: true,
    debounce: 20
  });

  const yBottomEndstop = new five.Button({
    pin: 5,
    isPullup: true,
    debounce: 20
  });

  // button handlers
  yUpButton.on("press", () => {
    console.log("Y-UP pressed");
    state.yUp = true;
    updateMotorState();
  });

  yUpButton.on("release", () => {
    console.log("Y-UP released");
    state.yUp = false;
    updateMotorState();
  });

  yDownButton.on("press", () => {
    console.log("Y-DOWN pressed");
    state.yDown = true;
    updateMotorState();
  });

  yDownButton.on("release", () => {
    console.log("Y-DOWN released");
    state.yDown = false;
    updateMotorState();
  });

  // endstop handlers with state change check
  yTopEndstop.on("press", () => {
    if (!state.yTopLimit) {  // only log if state is changing
      console.log("Y-TOP limit reached");
      state.yTopLimit = true;
      updateMotorState();
    }
  });

  yTopEndstop.on("release", () => {
    if (state.yTopLimit) {  // only log if state is changing
      console.log("Y-TOP limit cleared");
      state.yTopLimit = false;
      updateMotorState();
    }
  });

  yBottomEndstop.on("press", () => {
    if (!state.yBottomLimit) {  // only log if state is changing
      console.log("Y-BOTTOM limit reached");
      state.yBottomLimit = true;
      updateMotorState();
    }
  });

  yBottomEndstop.on("release", () => {
    if (state.yBottomLimit) {  // only log if state is changing
      console.log("Y-BOTTOM limit cleared");
      state.yBottomLimit = false;
      updateMotorState();
    }
  });

  // safety check interval
  setInterval(() => {
    updateMotorState();
  }, 100);

  // cleanup
  board.on("exit", () => {
    yMotor.stop();
  });

  console.log("Motor initialized");
});
