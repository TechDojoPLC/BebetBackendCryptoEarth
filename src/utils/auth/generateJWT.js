const jwt = require("jsonwebtoken");

function generateJWT(payload, secret, tokenLife) {
  const option = {};

  if (tokenLife) {
    option.expiresIn = tokenLife;
  }

  return jwt.sign(payload, secret, option);
}

module.exports = {
  generateJWT,
};
