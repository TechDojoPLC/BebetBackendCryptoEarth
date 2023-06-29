const mongoose = require("mongoose");
const { User } = require("./dbs");
const betService = require("./../modules/bet/bet.service");
const { params } = require("./globals");
const userService = require("./../modules/user/user.service")
const addSimulateUsers = async ({count: count}) => {
    let usersCount = await User.count();
    for (let i = 0; i < count; i ++){
        let date = new Date();
        let emailN = "test"+(usersCount+i) +"d"+date.getTime()+"@yandex.ru"
        let passwordN = "password"+usersCount;
        let newUser = {
            email: emailN,
            password: passwordN,
            t:true
        }
        let user = await userService.CreateSimulateUser(newUser)
    }
}

const getAllSimulateUsers = async () => {
    let usersT = await User.find({t: true, is_removed: false})
    return usersT
}
function getRandomArbitrary(min, max) {
    let t = Math.random() * (max - min) + min;
    return Math.floor(t)
  }
const createBetsBySimulate = async ({count, is_test}) => {
    let usersT = await User.find({t:true, is_removed: false})
    if (usersT.length - count <= 0){
        await addSimulateUsers({count: (usersT.length - count) * -1})
    }
    params.PlayersCountSimulation = count
    usersT = await User.find({t:true})
    if (params.currentGameSession){
        if (params.currentGameSession.status === "created"){
            for (let i = 0 ; i < usersT.length && i < count; i++)
            {
                let val = getRandomArbitrary(50, 500)
                let mult = getRandomArbitrary(120, 1500)/100
                if (is_test){
                    mult = getRandomArbitrary(1200, 2000)/100
                }
                await betService.CreateVirtualBet({game_session_id: params.currentGameSession._id, user_id: usersT[i]._id, value: val, multiplier: mult, is_auto_complete:true, order: 1})
            }
        }
    }

}
const createBetsBySimulateTest = async ({count, is_test}) => {
    let usersT = await User.find({t:true, is_removed: false})
    if (usersT.length - count <= 0){
        await addSimulateUsers({count: (usersT.length - count) * -1})
    }
    params.PlayersCountSimulation = count
    usersT = await User.find({t:true})
    if (params.currentGameSession){
        if (params.currentGameSession.status === "created"){
            for (let i = 0 ; i < usersT.length && i < count/2; i++)
            {
                let val = getRandomArbitrary(50, 1000)
                let mult = getRandomArbitrary(102, 500)/100
                if (is_test){
                    mult = getRandomArbitrary(102, 2000)/100
                }
                await betService.CreateVirtualBet({game_session_id: params.currentGameSession._id, user_id: usersT[i]._id, value: val, multiplier: mult, is_auto_complete:true, order: 1})
            }
            for (let i = count/2 ; i < usersT.length && i < count; i++)
            {
                let val = getRandomArbitrary(50, 1000)
                await betService.CreateVirtualBet({game_session_id: params.currentGameSession._id, user_id: usersT[i]._id, value: val, multiplier: 1, is_auto_complete:false, order: 1})
            }
        }
    }

}
const createBetsBySimulateRandomCount = async ({min, max, is_test}) => {
    let c = getRandomArbitrary(min, max)
    if (c%2 != 0){
        c += 1;
    }
    createBetsBySimulate({count: c, is_test: is_test})
}
module.exports = {
    createBetsBySimulate,
    createBetsBySimulateRandomCount,
};