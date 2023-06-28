const router = require("express").Router();

const walletController = require("./wallet.controller");

router
    .get("/getMainWallet", walletController.getMainWallet)

module.exports = router;
