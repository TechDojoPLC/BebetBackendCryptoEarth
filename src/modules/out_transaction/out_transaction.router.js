const router = require("express").Router();
const refTransactionController = require("../out_ref_transaction/out_ref_transaction.controller")

router
    .post("/requestOut", refTransactionController.requestOut)
    .get("/getAllRequests", refTransactionController.getAllRequests)

module.exports = router;
