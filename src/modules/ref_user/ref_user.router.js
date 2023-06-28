const router = require("express").Router();

const validateSchema = require("../../middlewares/validateSchema");

const userController = require("./ref_user.controller");
const { userTypes } = require("./ref_user.constants");

router
.post("/auth", userController.Authorize)
.get("/getCurrentUser", userController.GetCurrentUser)
.post("/updateData", userController.updateData)
.get("/getAllReferent", userController.getAllReferent)
.get("/getDashboard", userController.getDashboard)
.post("/getDashboardByDate", userController.getDashboardByDate)

module.exports = router;
