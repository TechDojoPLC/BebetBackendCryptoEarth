const confirmationService = require("./confirmation.service");

function sendCodeEmail(req, res) {
    const { email } = req.body;
    return confirmationService
      .sendCodeEmail(email)
      .then((info) => res.status(200).json(info))
      .catch((err) =>
        res.status(err.status || 400).json({
          error: err.message,
        })
      );
  }
  function  sendSubmitActionCodeToEmail(req, res) {
    const { email } = req.body;
    //console.log("sce1")
    return confirmationService
      .sendSubmitActionCodeToEmail(email)
      .then((info) => res.status(200).json(info))
      .catch((err) =>
        res.status(err.status || 400).json({
          error: err.message,
        })
      );
  }
function checkConfirmation(req, res) {

  return confirmationService
      .checkConfirmation(req.body)
      .then((info) => res.status(200).json(info))
      .catch((err) =>
      res.status(err.status || 400).json({
          error: err.message,
      })
      );
}
function checkConfirmationAndSetPassword(req, res) {

  return confirmationService
      .checkConfirmationAndSetPassword(req.body)
      .then((info) => res.status(200).json(info))
      .catch((err) =>
      res.status(err.status || 400).json({
          error: err.message,
      })
      );
}
  
module.exports = {
    checkConfirmation,
    sendCodeEmail,
    checkConfirmationAndSetPassword,
    sendSubmitActionCodeToEmail,
};
  