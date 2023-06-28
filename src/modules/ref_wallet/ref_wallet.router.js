const router = require("express").Router();

const refWalletController = require("./ref_wallet.controller");

router
    .get("/getMainWallet", refWalletController.getMainWallet)

module.exports = router;
