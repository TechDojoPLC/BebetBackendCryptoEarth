const { randomInteger } = require("../random");

function generateCode(size) {
  let confirmCode = `${randomInteger(1, 9)}`;

  for (let i = 0; i < size - 1; i++) {
    confirmCode = confirmCode + randomInteger(0, 9);
  }

  return confirmCode;
}

module.exports = generateCode;
