const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Admin } = require("../../utils/dbs");

const { messages } = require("../../utils/localization");

const { sendMessageToEmail } = require("../../utils/sendGrid");

async function login(body) {
  /*
  const email = body.email;
  const password = body.password;
  const user = await Admin.findOne({ email: email});
  if (!user || !user.password) {
    throw new Error(messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
  }

  const isPasswordEquals = password === user.password;

  if (!isPasswordEquals) {
    throw new Error(messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
  }
  return user;
  */
 return true;
}


module.exports = {
  login,
};
