const router = require("express").Router();
const refTransactionController = require("../in_transaction/in_transaction.controller")

router
    //.get("/getAllByUser", refTransactionController.GetAllByUser)
    .post("/createPaymentUrl", refTransactionController.createPaymentUrl)
module.exports = router;
