const { Create, Start, UpdateMultiplier, Stop } = require("../modules/game_session/game_session.service");
const { params } = require('./globals');
const https = require("https")
const fs = require('fs');
const { WebSocket, WebSocketServer } = require('ws');
const { getMainWallet } = require("../modules/wallet/wallet.service");
const betService = require("../modules/bet/bet.service");
const { Auth, User, Bet, Wallet } = require('./dbs');
const { status } = require('../modules/game_session/game_session.constants');
const { createBetsBySimulate, createBetsBySimulateRandomCount } = require('./simulate');
const { calcGS2, calcGS3 } = require('./gsCals');
const { Add, GetAllMessagesMainChat } = require("../modules/chat/chat.service");
const {log} = require("../utils/debug")
const settingsService = require("../modules/settings/settings.service")
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const GameSessionUpdater = async ({max_multiplier, max_time, step_per_tick}) =>{
    let interval = process.env.gameSessionInterval;
    for(let i = 0; i < (max_time*1000); i+=Number(interval)){
        await UpdateMultiplier({max_multiplier: max_multiplier, step_per_tick: step_per_tick});
        await sleep(Number(interval))
    }
    return true;
}
// Common WS
const GameSessionMake = async () =>{
    try{
        let settings = await settingsService.Get();
        if (!settings.is_active) throw new Error("Game is stopped!")
        await Create({start_multiplie:settings.min_multiplier});
        await sleep(450)
        await createBetsBySimulateRandomCount({min:settingsService.min_bot_count,max:settingsService.max_bot_count, is_test: false})
        await sleep(4550);
        let data = await calcGS3({interval:Number(process.env.gameSessionInterval)});
        await sleep(1000)
        log(params.currentGameSession, "game_session")
        await Start();
        await sleep(5000);
        await GameSessionUpdater({max_time: data.max_time, max_multiplier: data.max_multiplier, step_per_tick: params.currentGameSession.step});
        await Stop();
    }catch(e)
    {
        console.log(e)
    }

}


class wsServerGameClass {
     onConnect (wsClient) {
        try{
            if (params.Users.includes(wsClient)){
                wsClient.close();
            }
            params.Users.push(wsClient);
            params.UsersInGame.push(wsClient)
            wsClient.current_bets=[]
            console.log(`WSGAME${process.env.WS}: User connected`);
            wsClient.on('message', async function(event) {
            var data = JSON.parse(event)
            log(data, "websocket_game")
            if (data.type === "admin_request_add_value"){
                if (data.secret === process.env.WSADMINSECRET && data.value){
                    if (wsClient.user){
                        let wallet = await Wallet.findOne({user: wsClient.user._id})
                        if (!wallet){
                            wsClient.send(JSON.stringify({type: "error", message: "Unauthorized! Invalid secret!"}));
                            return
                        }
                        wallet.value += data.value;
                        await wallet.save();
                        wsClient.send(JSON.stringify({type: "info", message: "admin request completed!"}));
                    }
                    else{
                        wsClient.send(JSON.stringify({type: "error", message: "Unauthorized!"}));
                    }
                }
                else{
                    wsClient.send(JSON.stringify({type: "error", message: "Unauthorized! Invalid secret!"}));
                }
            }
            if (data.type === "get_players_count"){
               let realCount = params.UsersInGame.length;
               let botsCount = params.PlayersCountSimulation;
               let count = realCount+botsCount
               wsClient.send(JSON.stringify({type: "players_count", message: `${count}`}));
            }
            //WSAuth
            
            if (data.type === "authorization"){
                let foundAuthUser = await Auth.findOne({token: data.token})
                if (!foundAuthUser){
                    wsClient.send(JSON.stringify({type: "error", message: "Unauthorized"}));
                    return
                }
                let foundUser = await User.findOne({_id: foundAuthUser.user})
                if (!foundUser){
                    wsClient.send(JSON.stringify({type: "error", message: "User not found"}));
                    return
                }
                wsClient.user = foundUser;
                if (params.currentGameSession){
                    let userBet = Bet.findOne({game_session_id: params.currentGameSession._id})
                    if (userBet){
                        wsClient.current_bet = userBet;
                    }
                }
                wsClient.send(JSON.stringify({type: "info", user: wsClient.user}))
            }
    
            if (data.type === "make_bet"){
                if (wsClient.user){
                    if (data.value && data.multiplier && data.is_auto_complete != null && data.order != null){
                        if (params.UsersInGame.includes(wsClient)){
                            if (params.currentGameSession.status === status.created){
                                if (data.value >= Number(process.env.betMinLimit) && data.value <= Number(process.env.betMaxLimit)){
                                    let betObject = await betService.Create({order: Number(data.order), is_auto_complete: data.is_auto_complete, game_session_id: params.currentGameSession._id, user_id: wsClient.user._id, value: Number(data.value), multiplier: data.multiplier});
                                    if (betObject)
                                    {
                                        wsClient.current_bets.push(betObject);
                                        //console.log(betObject)
                                        wsClient.send(JSON.stringify({type: "Info", value: `Bet ${data.order} is made!`}))
                                        wsClient.send(JSON.stringify({type: "Refresh_wallet_data"}))
                                        for(let i = 0; i < params.UsersInGame.length; i++){
                                            wsClient.send(JSON.stringify({type: "refresh_bets"}))
                                        }
                                    }
                                    else{
                                        wsClient.send(JSON.stringify({type: "Info", value: `Bet ${data.order} is not made!`}))
                                    }
         
                                }else{
                                    wsClient.send(JSON.stringify({type: `Bet value invalid. Min value - ${process.env.betMinLimit} , max value - ${process.env.betMaxLimit}`}))
                                }
    
                            }
                        }
    
                    }
                }
            }
            
            if (data.type === "complete_bet"){
                if (wsClient.user){
                    if (params.UsersInGame.includes(wsClient)){
                        if (params.currentGameSession){
                            if (params.currentGameSession.status === status.started){
                                if (data.order){
                                    let betObject = await Bet.findOne({is_auto_complete: false, game_session: params.currentGameSession._id, user: wsClient.user._id, transacted: false, order: Number(data.order)})
                                    if (!betObject){
                                        return
                                    }
                                    //let is_won = betObject.multiplier <= params.currentGameSession.current_multiplier
                                    let betResulted = await betService.CompleteBet({bet_id: betObject._id, game_session_id: params.currentGameSession._id, is_won: true})
                                    wsClient.send(JSON.stringify({type: "bet_taken", order: Number(betObject.order), bet: betResulted}))
                                    wsClient.send(JSON.stringify({type: "refresh_wallet_data"}))
                                    for(let i = 0; i < params.UsersInGame.length; i++){
                                        wsClient.send(JSON.stringify({type: "refresh_bets"}))
                                    }
                                }
                            }
                        }
                    }
                }
            }
            })
    
            wsClient.on('close', function() {
                console.log("USER_DISCONNECTED_FROM_");
                params.Users = params.Users.filter((item)=>{ 
                    return item != wsClient
                })
                params.UsersInGame = params.UsersInGame.filter((item)=>{ 
                    return item != wsClient
                })
            })
        }catch(e){
            console.log(e)
            wsClient.send(JSON.stringify({type: "error", value: `${e}`}))
        }
    }
    runWebSocketServer () {
        const serverWSSGame = https.createServer({
            key: fs.readFileSync("./src/ssl_cert/key.key"), 
            cert: fs.readFileSync("./src/ssl_cert/cert.csr") 
        });
        const wss = new WebSocketServer({ server: serverWSSGame });
        wss.on('connection', this.onConnect)
        serverWSSGame.listen(process.env.WSGAMEPORT);
    }
}
class wsServerChatClass {
    onConnect (wsClient) {
        try{
            params.ChatUsers.push(wsClient);
            console.log(`WSCHAT${process.env.WSCHATPORT}: User connected`);
            
            wsClient.on('message', async function(event) {
              var data = JSON.parse(event)
              //console.log(data)
              if (data.type === "chat_authorization"){
                let foundAuthUser = await Auth.findOne({token: data.token})
                if (!foundAuthUser){
                    wsClient.send(JSON.stringify({type: "ChatAuthFail", error: "Unauthorized"}));
                    return
                }
                let foundUser = await User.findOne({_id: foundAuthUser.user})
                if (!foundUser){
                    wsClient.send(JSON.stringify({type: "ChatAuthFail", error: "User not found"}));
                    return
                }
                wsClient.user = foundUser;
                wsClient.send(JSON.stringify({type: "ChatAuthSuc", user: JSON.stringify(wsClient.user)}))
            }
            
              if (data.type === "chat_add_message"){
                if (wsClient.user){
                    let wallet = await getMainWallet(wsClient)
                    if (wallet){
                        if (wallet.value >= Number(process.env.chatLimit)){
                            let res = await Add({_id: wsClient.user._id, text: data.text});
                            //console.log(res)
                            for(let i = 0; i <  params.ChatUsers.length; i++){
                              params.ChatUsers[i].send(JSON.stringify({type: "new_message_added", text: res}));
                            }
                        }
                        else{
                            wsClient.send(JSON.stringify({type: "chat_blocked"}));
                        }
                    }else{
                        wsClient.send(JSON.stringify({type: "chat_blocked"}));
                    }

                }else{
                    wsClient.send(JSON.stringify({type: "unauthorized"}));
                }
              }
              if (data.type === "chat_get_messages"){
                  let mes = await GetAllMessagesMainChat();
                  wsClient.send(JSON.stringify({type: "messages", messages: mes}))
              }
            })
        
            wsClient.on('close', function() {
              console.log("USER_DISCONNECTED_FROM_CHAT_SOCKET");
              params.ChatUsers =  params.ChatUsers.filter((item)=>{ 
                  return item != wsClient
                })
              })
          }catch(e){
            console.log(e)
          }

   }
   runWebSocketServer () {
       const serverWSSChat = https.createServer({
           key: fs.readFileSync("./src/ssl_cert/key.key"), 
           cert: fs.readFileSync("./src/ssl_cert/cert.csr") 
       });
       const wss = new WebSocketServer({ server: serverWSSChat });
       wss.on('connection', this.onConnect)
       serverWSSChat.listen(process.env.WSCHATPORT);
   }
}


let wsServerGame = new wsServerGameClass();
//let wsServerTranslation = new wsServerClassGameWindow();
let wsServerChat = new wsServerChatClass();
module.exports = {
    wsServerGame,
    //wsServerTranslation,
    wsServerChat,
    GameSessionMake,
}