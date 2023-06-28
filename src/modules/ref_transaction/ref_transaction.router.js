const router = require("express").Router();
const refTransactionController = require("../ref_transaction/ref_transaction.controller")

router
    .get("/getAllByUser", refTransactionController.GetAllByUser)

module.exports = router;
