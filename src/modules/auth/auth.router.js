const router = require("express").Router();

const {

} = require("./auth.controller");

const validateSchema = require("../../middlewares/validateSchema");

const userController = require("../user/user.controller");
const { vkCallback, vkAuthorizer, C_vkAuthorizer } = require("./vkOAUTH.service");
const passport = require("passport");
router
    .post("/registrate", userController.Registrate)
    .post("/vk_authorize", C_vkAuthorizer)
    /*
    .get("/vkontakte", passport.authenticate("vkontakte"))
    .post("/vk_callback", passport.authenticate("vkontakte", {
        successRedirect: "/",
        failureRedirect: "/login",
    }))
    */

module.exports = router;
