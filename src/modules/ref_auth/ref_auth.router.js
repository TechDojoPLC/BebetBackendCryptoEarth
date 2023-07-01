const router = require("express").Router();



const refUserController = require("../ref_user/ref_user.controller")
router
    .post("/registrate", refUserController.Registrate)

module.exports = router;
