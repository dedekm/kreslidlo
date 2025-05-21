const { Board, Sensor } = require("johnny-five");
const board = new Board({ repl: false }); // REPL disabled

board.on("ready", () => {
  const xPin = new Sensor.Analog("A0");

  const xButtons = {
    right: { pressed: false, value: 410 },
    left: { pressed: false, value: 20 }
  }

  xPin.on("change", () => {
    if (xPin.value >= xButtons.right.value - 5 && xPin.value <= xButtons.right.value + 5) {
      console.log('X Pin RIGHT');
    } else if (xPin.value >= xButtons.left.value - 5 && xPin.value <= xButtons.left.value + 5) {
      console.log('X Pin LEFT');
    }
  });

  console.log("ready");
});
