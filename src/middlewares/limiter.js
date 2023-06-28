const rateLimit = require("express-rate-limit");

const {
  limiterSendEmail: { timeLimit, maxInTime },
} = require("../modules/auth/auth.constants");

const messages = require("../localizations/en.json");

const limiter = rateLimit({
  windowMs: timeLimit,
  max: maxInTime,
  message: {
    error: messages.ERRORS.AUTH.PLEASE_TRY_AGAIN_AFTER_AN,
  },
});

module.exports = limiter;
