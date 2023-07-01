const {
  Types: { ObjectId },
} = require("mongoose");

const {
  auth,
  server: { fullBaseUrl, clientUrl },
} = require("../../config");
const localization = require("../../localizations/en.json");

const { status } = require("./game_session.constants");
const { GameSession } = require("../../utils/dbs");
const { params} = require("../../utils/globals");
const { UsersInGame  } = require("../../utils/websocketCommon");
const { CompleteBets } = require("../bet/bet.service");


const sendWebSocketMessage = (wsClient, content) => {
  if (wsClient) wsClient.send(JSON.stringify(content));
}


const Create = async ({start_multiplie}) => {
  if (!params.currentGameSession)
  {
    let newGameSession = await GameSession.create({current_multiplier: start_multiplie, status: status.created})
    params.currentGameSession = newGameSession._doc;
    for(let i = 0; i < params.UsersInGame.length; i++)
      sendWebSocketMessage(params.UsersInGame[i], {type: "game_session_created", multiplier: params.currentGameSession.current_multiplier})
    if (params.gameTranslationSource) sendWebSocketMessage(params.gameTranslationSource, {type: "game_session_created", multiplier: params.currentGameSession.current_multiplier})
    return true
  }
  if (params.currentGameSession.status == status.ended)
  {
    let newGameSession = await GameSession.create({current_multiplier: start_multiplie, status: status.created})
    params.currentGameSession = newGameSession._doc;
    for(let i = 0; i < params.UsersInGame.length; i++){
      params.UsersInGame[i].current_bets = [];
      sendWebSocketMessage(params.UsersInGame[i], {type: "game_session_created", multiplier: params.currentGameSession.current_multiplier})
    }
    if (params.gameTranslationSource) sendWebSocketMessage(params.gameTranslationSource, {type: "game_session_created", multiplier: params.currentGameSession.current_multiplier})
    return true
  }
  return false;
}

const Start = async () =>{
  //console.log("Starting GameSession")
  if (params.currentGameSession){
    if (params.currentGameSession.status == status.created){
      params.currentGameSession.status = status.started;
      for(let i = 0; i < params.UsersInGame.length; i++){
        sendWebSocketMessage(params.UsersInGame[i], {type: "game_session_start", multiplier: params.currentGameSession.current_multiplier})
        if (params.UsersInGame[i].user){
          params.UsersInGame[i].bet_can_be_taken_done1 = false
          params.UsersInGame[i].bet_can_be_taken_done2 = false
        }
      }
      if (params.gameTranslationSource) sendWebSocketMessage(params.gameTranslationSource, {type: "game_session_start", multiplier: params.currentGameSession.current_multiplier, max_multiplier: params.currentGameSession.max_multiplier})
      return true
    }
    return false
  }
  return false
}
const Stop = async () =>{
  //console.log("Stop GS")
  if (params.currentGameSession){
    if (params.currentGameSession.status == status.started){
      params.currentGameSession.status = status.ended;
      for(let i = 0; i < params.UsersInGame.length; i++){
        sendWebSocketMessage(params.UsersInGame[i], {type: "game_session_stopped", multiplier: params.currentGameSession.current_multiplier})
      }
      if (params.gameTranslationSource) sendWebSocketMessage(params.gameTranslationSource, {type: "game_session_stopped", multiplier: params.currentGameSession.current_multiplier})
      let GameSessionFound = await GameSession.findOne({_id: params.currentGameSession._id})
      GameSessionFound.current_multiplier = params.currentGameSession.current_multiplier
      await GameSessionFound.save()
      let results = await CompleteBets({game_session_id: params.currentGameSession._id})
      //console.log(results)
      for(let i = 0; i < results.usersWon.length; i++){
        let userT = await params.UsersInGame.filter((item)=>{
          if (item.user)
            return String(item.user._id) ==  String(results.usersWon[i].user._id)
          return false
        })[0]
        if (userT)
          sendWebSocketMessage(userT, {type: "game_session_won", value: results.usersWon[i].bet})
      }
      for(let i = 0; i < results.usersLose.length; i++){
        let userT = await params.UsersInGame.filter((item)=>{
          if (item.user)
            return  String(item.user._id) ==  String(results.usersLose[i].user._id)
          return false
        })[0]
        if (userT)
          sendWebSocketMessage(userT, {type: "game_session_lose", value: results.usersLose[i].bet})
      }
      return true
    }
    return false

  }
  return false

}
const UpdateMultiplier = async ({max_multiplier, step_per_tick}) => {
  if (params.currentGameSession){
    if (params.currentGameSession.status == status.started){
        params.currentGameSession.current_multiplier += step_per_tick
        //console.log(params.currentGameSession.current_multiplier)
      for(let i = 0; i < params.UsersInGame.length; i++){
        sendWebSocketMessage(params.UsersInGame[i], {type: "game_session_updated", multiplier: params.currentGameSession.current_multiplier})
        if (params.UsersInGame[i].current_bets){
          //console.log(params.UsersInGame[i].current_bets)
          if (params.UsersInGame[i].current_bets[0]){
            if (!params.UsersInGame[i].current_bets[0].is_auto_complete){
              if (params.currentGameSession.current_multiplier >= 1.02){
                if (params.UsersInGame[i].bet_can_be_taken_done1 === false){
                  sendWebSocketMessage(params.UsersInGame[i], {type: "bet_can_be_taken", order: params.UsersInGame[i].current_bets[0].order})
                  params.UsersInGame[i].bet_can_be_taken_done1 = true;
                }
              }
            }
          }
          if (params.UsersInGame[i].current_bets[1]){
            if (!params.UsersInGame[i].current_bets[1].is_auto_complete){
              if (params.currentGameSession.current_multiplier >= params.UsersInGame[i].current_bets[1].multiplier){
                if (params.UsersInGame[i].bet_can_be_taken_done2 === false){
                  sendWebSocketMessage(params.UsersInGame[i], {type: "bet_can_be_taken", order: params.UsersInGame[i].current_bets[1].order})
                  params.UsersInGame[i].bet_can_be_taken_done2 = true;
                }
              }
            }
          }
        }
      }
      if (params.gameTranslationSource) sendWebSocketMessage(params.gameTranslationSource, {type: "game_session_updated", multiplier: params.currentGameSession.current_multiplier})
      return true
    }
    return false

  }
  return false

}

const GetAll = async ({count}) => {
  if (!count){  
    const foundGameSession = await GameSession.find({}).sort({createdAt: -1})
    return foundGameSession
  }
  if (Number(count) > 0){
    const foundGameSession = await GameSession.find({}).sort({createdAt: -1}).limit(Number(count))
    return foundGameSession
  }
  const foundGameSession = await GameSession.find({}).sort({createdAt: -1})
  return foundGameSession
}
const Update = async (req) => {

  return true
}

const FinishSession = async ({session_id}) => {
  const foundGameSession = await GameSession.findOne({_id: _id})
  if (!foundGameSession){
    throw new Error(messages.ERRORS.ORDER.ORDER_NOT_FOUND)
  }

}
const SetStatus = async ({session_id, status}) => {
  const _id = req.params.id;
  const foundOrder = await GameSession.findOne({_id: _id})
  if (!foundOrder){
    throw new Error(messages.ERRORS.ORDER.ORDER_NOT_FOUND)
  }
  foundOrder.status = status;
  await foundOrder.save();
  return
}
const Delete = async (req) => {
  const _id = req.params.id;
  const foundGameSession = await GameSession.findOne({_id: _id})
  if (!foundGameSession){
    throw new Error(messages.ERRORS.GameSession.GameSession)
  }
  foundGameSession.is_removed = true;
  await foundGameSession.save();
  return true;
}
module.exports = {
  Create,
  Start,
  Stop,
  UpdateMultiplier,
  //Admin functions
  GetAll,
  Update,
  Delete,
};
