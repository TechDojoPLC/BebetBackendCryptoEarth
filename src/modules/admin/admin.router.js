const router = require("express").Router();


const controller = require("./admin.controller");

const chatController = require("../chat/chat.controller")
const chatService = require("../chat/chat.service");
router
  .post("/login",  controller.login)

  //Chats
  .get("/Chat/GetAll",  chatController.GetAll)
  .get("/Chat/:id",  chatController.GetAllMessagesByOrder)
  .post("/Chat/Create",  chatService.Create)
  .post("/Chat/Add/:id",  chatController.Add)
  //Wallets

  module.exports = router;
