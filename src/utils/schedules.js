const cron = require('node-cron');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { GameSessionMake } = require('./websocketCommon');
const { params } = require('./globals');

let CurrentSchedules = []
function sheduleGameSessionStart() {
    var task = cron.schedule(`*/30 * * * * *`, async () =>  {
        try{
            GameSessionMake();
        }catch(err){
            console.log(err)
        }
    });
    CurrentSchedules.push(task)
    task.start()
}

module.exports = {
    sheduleGameSessionStart,
};
