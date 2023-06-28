const router = require("express").Router();

const validateSchema = require("../../middlewares/validateSchema");
const limiter = require("../../middlewares/limiter");
const betController = require("./bet.controller");

router
    .get("/getMyBets", betController.GetAllByUserId)
    .get("/getMyBets/:count", betController.GetAllByUserIdCount)
    .get("/getAllBets", betController.GetAll)
    .get("/getAllBets/:count", betController.GetAllWithCount)
    .get("/GetAllByCurrentGame", betController.GetAllByCurrentGame)
    
module.exports = router;
