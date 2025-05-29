const five = require("johnny-five");
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

const PIN_BUTTON_UP = 2;
const PIN_BUTTON_DOWN = 3;
const PIN_BUTTON_RIGHT = 4;
const PIN_BUTTON_LEFT = 5;

const PIN_LIMIT_UP = 6;
const PIN_LIMIT_DOWN = 7;
const PIN_LIMIT_RIGHT = 8;
const PIN_LIMIT_LEFT = 9;

const PIN_MOTOR_UP = 10;
const PIN_MOTOR_DOWN = 11;

const PIN_STEPPER_DIR = 12;
const PIN_STEPPER_STEP = 13;

const MOTOR_SPEED_UP = 70;
const MOTOR_SPEED_DOWN = 40;

const INIT_DELAY = 1000; // 1 second delay before enabling logs

const board = new five.Board({ repl: false });

const buttonsPressed = {
  right: false,
  left: false
}

const endstopsPressed = {
  right: false,
  left: false
}

class Motor {
  constructor(board, upPin, downPin, upSpeed, downSpeed) {
    this.board = board;
    this.upPin = upPin;
    this.downPin = downPin;
    this.upSpeed = upSpeed;
    this.downSpeed = downSpeed;
    this.moveStartTime = null;
    this.currentDirection = null;
    this.loggingEnabled = false;
    this.updateCount = 0;
    this.initialize();
  }

  initialize() {
    this.board.pinMode(this.upPin, five.Pin.PWM);
    this.board.pinMode(this.downPin, five.Pin.PWM);
    setTimeout(() => {
      this.loggingEnabled = true;
    }, INIT_DELAY);
  }

  up() {
    if (this.currentDirection !== 'up') {
      this.stop();
      this.moveStartTime = Date.now();
      this.currentDirection = 'up';
      this.updateCount = 0;
    }
    this.updateCount++;
    this.board.analogWrite(this.upPin, this.upSpeed);
    this.board.analogWrite(this.downPin, 0);
  }

  down() {
    if (this.currentDirection !== 'down') {
      this.stop();
      this.moveStartTime = Date.now();
      this.currentDirection = 'down';
      this.updateCount = 0;
    }
    this.updateCount++;
    this.board.analogWrite(this.upPin, 0);
    this.board.analogWrite(this.downPin, this.downSpeed);
  }

  stop() {
    if (this.currentDirection !== null && this.loggingEnabled) {
      const duration = ((Date.now() - this.moveStartTime) / 1000).toFixed(1);
      log(`Motor stopped after moving ${this.currentDirection.toUpperCase()} for ${duration}s (${this.updateCount} updates)`);
      this.currentDirection = null;
    }
    this.board.analogWrite(this.upPin, 0);
    this.board.analogWrite(this.downPin, 0);
  }
}

board.on("ready", function() {
  initializeStepper();
  initializeMotor();

  log("Kreslidlo ready");
  log("---");
});

function initializeMotor() {
  const yMotor = new Motor(board, PIN_MOTOR_UP, PIN_MOTOR_DOWN, MOTOR_SPEED_UP, MOTOR_SPEED_DOWN);
  let loggingEnabled = false;

  const state = {
    yUp: false,
    yDown: false,
    yTopLimit: false,
    yBottomLimit: false
  };

  function updateMotorState() {
    if ((state.yUp && state.yDown) || (!state.yUp && !state.yDown)) {
      yMotor.stop();
      return;
    }

    if (state.yUp) {
      if (!state.yTopLimit) {
        yMotor.up();
      } else {
        yMotor.stop();
      }
      return;
    }

    if (state.yDown) {
      if (!state.yBottomLimit) {
        yMotor.down();
      } else {
        yMotor.stop();
      }
      return;
    }
  }

  const yUpButton = new five.Button({ pin: PIN_BUTTON_UP, isPullup: true });
  const yDownButton = new five.Button({ pin: PIN_BUTTON_DOWN, isPullup: true });
  const yTopEndstop = new five.Button({ pin: PIN_LIMIT_UP, isPullup: true });
  const yBottomEndstop = new five.Button({ pin: PIN_LIMIT_DOWN, isPullup: true });

  setTimeout(() => {
    loggingEnabled = true;
  }, INIT_DELAY);

  yUpButton.on("press", () => {
    if (loggingEnabled) log("Button: Y-UP pressed");
    state.yUp = true;
    updateMotorState();
  });

  yUpButton.on("release", () => {
    if (loggingEnabled) log("Button: Y-UP released");
    state.yUp = false;
    updateMotorState();
  });

  yDownButton.on("press", () => {
    if (loggingEnabled) log("Button: Y-DOWN pressed");
    state.yDown = true;
    updateMotorState();
  });

  yDownButton.on("release", () => {
    if (loggingEnabled) log("Button: Y-DOWN released");
    state.yDown = false;
    updateMotorState();
  });

  yTopEndstop.on("press", () => {
    if (!state.yTopLimit && loggingEnabled) {
      log("Limit: Y-TOP reached");
      state.yTopLimit = true;
      updateMotorState();
    }
  });

  yTopEndstop.on("release", () => {
    if (state.yTopLimit && loggingEnabled) {
      log("Limit: Y-TOP cleared");
      state.yTopLimit = false;
      updateMotorState();
    }
  });

  yBottomEndstop.on("press", () => {
    if (!state.yBottomLimit && loggingEnabled) {
      log("Limit: Y-BOTTOM reached");
      state.yBottomLimit = true;
      updateMotorState();
    }
  });

  yBottomEndstop.on("release", () => {
    if (state.yBottomLimit && loggingEnabled) {
      log("Limit: Y-BOTTOM cleared");
      state.yBottomLimit = false;
      updateMotorState();
    }
  });

  setInterval(() => {
    updateMotorState();
  }, 100);

  board.on("exit", () => {
    yMotor.stop();
  });

  log("Motor initialized");
}

function initializeStepper() {
  const speed = 80;
  const stepsPerRev = 200;
  const microSteps = 16;
  const microStepsPerRev = stepsPerRev * microSteps;
  const smallStepAmount = Math.floor(microStepsPerRev / 100);

  let moveStartTime = null;
  let stepCount = 0;
  let isMoving = false;
  let currentDirection = null;
  let loggingEnabled = false;

  const buttonRight = new five.Button({ pin: PIN_BUTTON_RIGHT, isPullup: true });
  const buttonLeft = new five.Button({ pin: PIN_BUTTON_LEFT, isPullup: true });
  const endstopRight = new five.Button({ pin: PIN_LIMIT_RIGHT, isPullup: true });
  const endstopLeft = new five.Button({ pin: PIN_LIMIT_LEFT, isPullup: true });

  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: microStepsPerRev,
    pins: {
      dir: PIN_STEPPER_DIR,
      step: PIN_STEPPER_STEP
    }
  });

  stepper.rpm(speed);

  setTimeout(() => {
    loggingEnabled = true;
  }, INIT_DELAY);

  buttonRight.on("press", () => {
    if (loggingEnabled) log("Button: X-RIGHT pressed");
    buttonsPressed.right = true;
    checkAndMove();
  });

  buttonRight.on("release", () => {
    if (loggingEnabled) log("Button: X-RIGHT released");
    buttonsPressed.right = false;
    checkAndMove();
  });

  buttonLeft.on("press", () => {
    if (loggingEnabled) log("Button: X-LEFT pressed");
    buttonsPressed.left = true;
    checkAndMove();
  });

  buttonLeft.on("release", () => {
    if (loggingEnabled) log("Button: X-LEFT released");
    buttonsPressed.left = false;
    checkAndMove();
  });

  endstopRight.on("press", () => {
    if (loggingEnabled) log("Limit: X-RIGHT reached");
    endstopsPressed.right = true;
  });

  endstopRight.on("release", () => {
    if (loggingEnabled) log("Limit: X-RIGHT cleared");
    endstopsPressed.right = false;
  });

  endstopLeft.on("press", () => {
    if (loggingEnabled) log("Limit: X-LEFT reached");
    endstopsPressed.left = true;
  });

  endstopLeft.on("release", () => {
    if (loggingEnabled) log("Limit: X-LEFT cleared");
    endstopsPressed.left = false;
  });

  function checkAndMove() {
    if (buttonsPressed.right && buttonsPressed.left) {
      if (loggingEnabled) log("Both X buttons pressed - stopping");
      return;
    }

    if (!stepper.isMoving) {
      if (buttonsPressed.right && !endstopsPressed.right) {
        if (!isMoving || currentDirection !== 'right') {
          moveStartTime = Date.now();
          stepCount = 0;
          isMoving = true;
          currentDirection = 'right';
        }
        stepCount++;
        stepper.cw().step(smallStepAmount, () => {
          if (buttonsPressed.right && !endstopsPressed.right) {
            checkAndMove();
          } else {
            if (loggingEnabled) {
              const duration = ((Date.now() - moveStartTime) / 1000).toFixed(1);
              log(`Stepper stopped after moving RIGHT for ${duration}s (${stepCount} cycles)`);
            }
            isMoving = false;
            currentDirection = null;
          }
        });
      } else if (buttonsPressed.left && !endstopsPressed.left) {
        if (!isMoving || currentDirection !== 'left') {
          moveStartTime = Date.now();
          stepCount = 0;
          isMoving = true;
          currentDirection = 'left';
        }
        stepCount++;
        stepper.ccw().step(smallStepAmount, () => {
          if (buttonsPressed.left && !endstopsPressed.left) {
            checkAndMove();
          } else {
            if (loggingEnabled) {
              const duration = ((Date.now() - moveStartTime) / 1000).toFixed(1);
              log(`Stepper stopped after moving LEFT for ${duration}s (${stepCount} cycles)`);
            }
            isMoving = false;
            currentDirection = null;
          }
        });
      }
    }
  }

  log("Stepper initialized");
}
