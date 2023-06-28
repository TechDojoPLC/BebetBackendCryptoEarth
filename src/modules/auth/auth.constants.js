const limiterSendEmail = {
  timeLimit: 60000, //ONE MINUTE
  maxInTime: 1,
};

const regexForPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}/;

const messageForResetPassword = `Click for change your password: `;

module.exports = {
  limiterSendEmail,
  regexForPassword,
  messageForResetPassword,
};
