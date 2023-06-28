const mongoose = require("mongoose");

const fs = require("fs")

const { saveFileToFolder, deleteFile, ReadFile } = require("../../utils/file/fileHelper");
const { Background, ChatMessage, User } = require("../../utils/dbs");
const { folderNameForBackgroundContent} = require("./chat_message.constants")


const {
  server: { pathToStaticFiles, fullBaseUrl },
  fileMaxSize,
  imgMimetype,
} = require("../../config");
const { resolve } = require("path");
const localization = require("../../utils/localization");

async function GetAll(){
  const chatMessages = await ChatMessage.find({})
  return chatMessages;
}
async function Get({_id}){
  const chatMessage = await ChatMessage.findOne({_id: _id})
  return chatMessage;
}
async function GetByChatRoom({_id}){
  const chatMessages = await ChatMessage.find({chat: _id})
  let result = []
  for(let i = 0; i < chatMessages.length; i++){
    let res = {}
    Object.assign(res,chatMessages[i]._doc)
    let userFound = await User.findOne({_id:chatMessages[i].user})
    if (userFound){
      res.userObj = {name: userFound.name};
    }
    else{
      res.userObj = {name: "hidden"}
    }
    result.push(res)
  }
  return result;
}

module.exports = {
  GetAll,
  Get,
  GetByChatRoom,
};
