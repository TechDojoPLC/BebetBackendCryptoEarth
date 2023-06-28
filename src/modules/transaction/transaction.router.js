const router = require("express").Router();
const refTransactionController = require("../transaction/transaction.controller")

router
    .get("/getAllByUser", refTransactionController.GetAllByUser)

module.exports = router;
