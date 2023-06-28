const router = require("express").Router();

const refRefsController = require("./ref_refs.controller");

router
    .post("/Create", refRefsController.Create)
    .get("/GetByCurrentUser", refRefsController.GetByCurrentUser)
    
module.exports = router;
