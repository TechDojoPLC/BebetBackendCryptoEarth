const router = require("express").Router();

const controller = require("./chat.controller")

router
  .get("/GetAll",  controller.GetAll)

module.exports = router;
