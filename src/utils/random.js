const { randomBytes } = require("crypto");

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);

  return Math.floor(rand);
}

function randomString(size) {
  const rand = randomBytes(size).toString("hex").slice(0, size);

  return rand;
}

function generatePassword(length) {
  charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

module.exports = {
  randomInteger,
  randomString,
  generatePassword,
};
