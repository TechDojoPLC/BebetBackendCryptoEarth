const router = require("express").Router();

const betController = require("./bet.controller");
const { AttachUserByTokenOrUserData } = require("../../utils/auth/attachUser");

router
    .get("/getMyBets", AttachUserByTokenOrUserData, betController.GetAllByUserId)
    .get("/getMyBets/:count", AttachUserByTokenOrUserData, betController.GetAllByUserIdCount)
    .get("/getAllBets", betController.GetAll)
    .get("/getAllBetsTop/:count", betController.GetAllTopWithCount)
    .get("/getAllBets/:count", betController.GetAllWithCount)
    .get("/GetAllByCurrentGame", betController.GetAllByCurrentGame)
    
module.exports = router;
