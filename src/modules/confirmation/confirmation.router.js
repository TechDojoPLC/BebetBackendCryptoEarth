const router = require("express").Router();

const {
    sendCodeEmail,
    checkConfirmation,
    checkConfirmationAndSetPassword,
    sendSubmitActionCodeToEmail,
} = require("./confirmation.controller");

router.post("/email-verify", sendCodeEmail);
router.post("/checkConfirmationAndSetPassword", checkConfirmationAndSetPassword);

router.post("/checkConfirmation", checkConfirmation);

router.post("/sendSubmitActionCodeToEmail", sendSubmitActionCodeToEmail);

module.exports = router;