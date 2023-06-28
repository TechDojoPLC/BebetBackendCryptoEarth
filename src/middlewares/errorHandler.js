const { messages } = require("../utils/localization");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.log(err)
  const { message, status } = err;

  switch (err.name) {
    case "UnauthorizedError":
      return res.status(401).json({
        error: messages.ERRORS.AUTH.UNAUTHORIZED,
      });

    default:
      return res.status(status || 500).json({ error: message });
  }
};

module.exports = errorHandler;
