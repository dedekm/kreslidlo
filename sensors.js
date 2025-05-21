const { Board, Sensor } = require("johnny-five");
const board = new Board({ repl: false }); // REPL disabled

board.on("ready", () => {
  const cwLimit = new Sensor.Digital("A0");

  cwLimit.on("change", () => {
    console.log('CW limit changed:', cwLimit.value);
  });

  console.log("ready");
});
