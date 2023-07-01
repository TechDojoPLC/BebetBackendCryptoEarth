const router = require("express").Router();


const controller = require("./admin.controller");

router
  .post("/login",  controller.login)

  module.exports = router;
