const router = require("express").Router();

const controller = require("./chat_message.controller")

router
  .get("/GetAll",  controller.GetAll)

module.exports = router;
