const mongoose = require("mongoose");

const fs = require("fs")

const { saveFileToFolder, deleteFile, ReadFile } = require("../../utils/file/fileHelper");
const { Background, Chat, ChatMessage, Order, User } = require("../../utils/dbs");
const { folderNameForBackgroundContent} = require("./chat.constants")


const {
  server: { pathToStaticFiles, fullBaseUrl },
  fileMaxSize,
  imgMimetype,
} = require("../../config");
const { resolve } = require("path");
const localization = require("../../utils/localization");
const { GetByChatRoom } = require("../chat_message/chat_message.service");

async function GetAll(){
  const chats = await Chat.find({})
  let res = []
  for(let i = 0; i < chats.length; i++){
    let resTemp = {}
    Object.assign(resTemp, chats[i]._doc);
    resTemp.messages = await GetAllMessages({_id: chats[i]._id})
    res.push(resTemp)
  }
  //console.log(res)
  return res;
}
async function GetAllMessages({_id}){
  const messages = await GetByChatRoom({_id})
  return messages;
}

async function GetAllMessagesMainChat(){
  const chat = await Chat.find({})
  let selectedChat = null
  if (chat.length == 0){
    selectedChat = await Chat.create({})
  }
  else{
    selectedChat = chat[0]
  }
  const messages = await GetByChatRoom({_id: selectedChat._id})
  return messages;
}
async function Create({}){
  const chat = await Chat.create({})
  return chat;
}
async function Add({_id, text, type}){
  try{
    let foundUser = await User.findOne({_id: _id})
    if (!foundUser){
      throw new Error(localization.messages.ERRORS.USER.USER_DOES_NOT_EXIST)
    }
    const chat = await Chat.find({})
    let selectedChat = null
    if (chat.length == 0){
      selectedChat = await Chat.create({})
    }
    else{
      selectedChat = chat[0]
    }
    const chatMessage = await ChatMessage.create({chat: selectedChat._id, text: text, user: foundUser._id})
    if (type){
      chatMessage.type = type
      await chatMessage.save();
    }
    let res = {}
    Object.assign(res,chatMessage._doc)
    res.userObj = {name: foundUser.name}
    return res;
    
  }catch(e){
    console.log(e)
    return
  }
}
module.exports = {
  GetAll,
  GetAllMessages,
  Create,
  Add,
  GetAllMessagesMainChat,
};
