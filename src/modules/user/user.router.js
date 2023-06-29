const router = require("express").Router();

const validateSchema = require("../../middlewares/validateSchema");

const userController = require("./user.controller");
const { userTypes } = require("./user.constants");

router
    .post("/auth", userController.Authorize)
    .get("/getCurrentUser", userController.GetCurrentUser)
    .post("/updateData", userController.updateData)
    .post("/updatePassword", userController.updatePassword)
    .post("/ref_connect", userController.RefConnect)
    .get("/getUserStatistics", userController.getUserStatistics)
    
module.exports = router;
