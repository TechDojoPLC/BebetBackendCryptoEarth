const router = require("express").Router();



const userController = require("../user/user.controller");
const { C_vkAuthorizer } = require("./vkOAUTH.service");
router
    .post("/registrate", userController.Registrate)
    .post("/vk_authorize", C_vkAuthorizer)

module.exports = router;
