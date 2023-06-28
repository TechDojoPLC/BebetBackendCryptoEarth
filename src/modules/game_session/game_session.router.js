const router = require("express").Router();

const validateSchema = require("../../middlewares/validateSchema");
const limiter = require("../../middlewares/limiter");
const gameSessionController = require("./game_session.controller")


module.exports = router;
