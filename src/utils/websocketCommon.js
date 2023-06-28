const { Create, Start, UpdateMultiplier, Stop } = require("../modules/game_session/game_session.service");
const { params } = require('./globals');
const https = require("https")
const fs = require('fs');

const betService = require("../modules/bet/bet.service");
const { Auth, User, Bet, Wallet } = require('./dbs');
const { status } = require('../modules/game_session/game_session.constants');
const { createBetsBySimulate, createBetsBySimulateRandomCount } = require('./simulate');
const { calcGS2 } = require('./gsCals');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const GameSessionUpdater = async ({max_multiplier, max_time, step_per_tick}) =>{
    let interval = process.env.gameSessionInterval;
    for(let i = 0; i < ((1000 * max_time)/interval); i++){
        let ccc = await UpdateMultiplier({max_multiplier: max_multiplier, step_per_tick: step_per_tick});
        await sleep(interval)
    }
    return true;
}
// Common WS
const GameSessionMake = async ({start_multiplie, step_per_tick, is_test}) =>{
    let c = await Create({start_multiplie:1.02});
    await sleep(250)
    await createBetsBySimulateRandomCount({min:3,max:15, is_test: is_test})
    await sleep(250)
    let data = await calcGS2({interval:Number(process.env.gameSessionInterval)});
    await sleep(5000);
    console.log(params.currentGameSession)
    let cc = await Start();
    await sleep(5000);
    console.log(cc)
    let ccc = await GameSessionUpdater({max_time: data.max_time, max_multiplier: data.max_multiplier, step_per_tick: params.currentGameSession.step});
    let cccc = await Stop();
    console.log(cccc)
}
const { WebSocket, WebSocketServer } = require('ws');

class wsServerClass {
     onConnect (wsClient) {
        if (params.Users.includes(wsClient)){
            wsClient.close();
        }
        params.Users.push(wsClient);
        params.UsersInGame.push(wsClient)
        wsClient.current_bets=[]
        console.log('USER_CONNECTED_TO_SOCKET_9000');
        wsClient.on('message', async function(event) {
            var data = JSON.parse(event)
            console.log(data)
        //WSAdminFuncs 
        if (data.type === "admin_request_start"){
            if (data.secret === process.env.WSADMINSECRET && data.max_multiplier && data.start_multiplie && data.step_per_tick &&data.is_test != null){
                GameSessionMake({max_multiplier: Number(data.max_multiplier), start_multiplie: Number(data.start_multiplie), step_per_tick: Number(data.step_per_tick), is_test:data.is_test});
                wsClient.send(JSON.stringify({type: "info", error: "admin request completed!"}));
            }
            else{
                wsClient.send(JSON.stringify({type: "error", error: "Unauthorized! Invalid secret!"}));
            }
        }
        //test
        if (data.type === "admin_request_add_value"){
            if (data.secret === process.env.WSADMINSECRET && data.value){
                if (wsClient.user){
                    let wallet = await Wallet.findOne({user: wsClient.user._id})
                    if (!wallet){
                        wsClient.send(JSON.stringify({type: "error", error: "Unauthorized! Invalid secret!"}));
                        return
                    }
                    wallet.value += data.value;
                    await wallet.save();
                    wsClient.send(JSON.stringify({type: "info", error: "admin request completed!"}));
                }
                else{
                    wsClient.send(JSON.stringify({type: "error", error: "Unauthorized!"}));
                }
            }
            else{
                wsClient.send(JSON.stringify({type: "error", error: "Unauthorized! Invalid secret!"}));
            }
        }
        //WSAuth
        
        if (data.type === "authorization"){
            let foundAuthUser = await Auth.findOne({token: data.token})
            if (!foundAuthUser){
                wsClient.send(JSON.stringify({type: "error", error: "Unauthorized"}));
                return
            }
            let foundUser = await User.findOne({_id: foundAuthUser.user})
            if (!foundUser){
                wsClient.send(JSON.stringify({type: "error", error: "User not found"}));
                return
            }
            wsClient.user = foundUser;
            if (params.currentGameSession){
                let userBet = Bet.findOne({game_session_id: params.currentGameSession._id})
                if (userBet){
                    wsClient.current_bet = userBet;
                }
            }
            wsClient.send(JSON.stringify({type: "Info", value: wsClient.user}))
        }
        /*
        //WSGameCheck
        if (data.type === "request_for_entry"){
            if (wsClient.user){
                if (!params.UsersInGame.includes(wsClient))
                    params.UsersInGame.push(wsClient)
                console.log(params.UsersInGame.length)
            }
        }*/
        /*
        if (data.type === "request_for_quit"){
            if (wsClient.user){
                params.UsersInGame = params.UsersInGame.filter((item)=>{ 
                    return item != wsClient
                })
            }
        }
        */

        if (data.type === "make_bet"){
            if (wsClient.user){
                if (data.value && data.multiplier && data.is_auto_complete != null && data.order != null){
                    if (params.UsersInGame.includes(wsClient)){
                        if (params.currentGameSession.status === status.created){
                            if (data.value >= Number(process.env.betMinLimit) && data.value <= Number(process.env.betMaxLimit)){
                                let betObject = await betService.Create({order: Number(data.order), is_auto_complete: data.is_auto_complete, game_session_id: params.currentGameSession._id, user_id: wsClient.user._id, value: Number(data.value), multiplier: data.multiplier});
                                wsClient.current_bets.push(betObject);
                                console.log(betObject)
                                wsClient.send(JSON.stringify({type: "Info", value: `Bet ${data.order} is made!`}))
                                wsClient.send(JSON.stringify({type: "Refresh_wallet_data"}))
                                for(let i = 0; i < params.UsersInGame.length; i++){
                                    wsClient.send(JSON.stringify({type: "refresh_bets"}))
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
                            if (data.value){
                                let betObject = await Bet.findOne({is_auto_complete: false, game_session: params.currentGameSession._id, user: wsClient.user._id, transacted: false, order: Number(data.value)})
                                if (!betObject){
                                    return
                                }
                                let is_won = betObject.multiplier <= params.currentGameSession.current_multiplier
                                await betService.CompleteBet({bet_id: betObject._id, game_session_id: params.currentGameSession._id, is_won: is_won})
                                wsClient.send(JSON.stringify({type: "Bet_taken", order: Number(betObject.order)}))
                                wsClient.send(JSON.stringify({type: "Refresh_wallet_data"}))
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
            console.log("USER_DISCONNECTED_FROM_SOCKET_9000");
            params.Users = params.Users.filter((item)=>{ 
                return item != wsClient
            })
            params.UsersInGame = params.UsersInGame.filter((item)=>{ 
                return item != wsClient
            })
        })

    }
    runWebSocketServer () {
        const serverWSSChat = https.createServer({
            key: fs.readFileSync("./src/ssl_cert/key.key"), 
            cert: fs.readFileSync("./src/ssl_cert/cert.csr") 
        });
        const wss = new WebSocketServer({ server: serverWSSChat });
        wss.on('connection', this.onConnect)
        serverWSSChat.listen(9002);
    }
}
class wsServerClassGameWindow {
    onConnect (wsClient) {
       if (params.gameTranslationSource){
           wsClient.close();
       }
       console.log(`USER_CONNECTED_TO_SOCKET_${process.env.WSCOMMONGAMEPORT}`);
       wsClient.on('message', async function(event) {
           var data = JSON.parse(event)
           console.log(data)

           if (data.type === "request_source"){
            if (data.key === process.env.WSSOURCEADMINSECRET){
                params.gameTranslationSource = wsClient
                wsClient.send(JSON.stringify({type:"request_success"}))
            }
            else{
                wsClient.send(JSON.stringify({type:"request_failed"}))
            }
           }
        })

       wsClient.on('close', function() {
           console.log(`USER_DISCONNECTED_FROM_SOCKET_${process.env.WSCOMMONGAMEPORT}`);
           params.gameTranslationSource = null;
       })

   }
   runWebSocketServer () {
        const serverWSSChat = https.createServer({
            key: fs.readFileSync("./src/ssl_cert/key.key"), 
            cert: fs.readFileSync("./src/ssl_cert/cert.csr") 
        });
        const wss = new WebSocketServer({ server: serverWSSChat });
        wss.on('connection', this.onConnect)
        serverWSSChat.listen(process.env.WSCOMMONGAMEPORT);
   }
}
let wsServerObject = new wsServerClass();
let wsServerTranslation = new wsServerClassGameWindow();
module.exports = {
    wsServerObject,
    wsServerTranslation,
    GameSessionMake,
}