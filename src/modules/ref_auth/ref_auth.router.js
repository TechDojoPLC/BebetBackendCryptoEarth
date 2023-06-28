const router = require("express").Router();


const validateSchema = require("../../middlewares/validateSchema");

const refUserController = require("../ref_user/ref_user.controller")
router
    .post("/registrate", refUserController.Registrate)

module.exports = router;
