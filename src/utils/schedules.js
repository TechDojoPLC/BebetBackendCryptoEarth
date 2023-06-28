const cron = require('node-cron');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { GameSessionMake } = require('./websocketCommon');
const { params } = require('./globals');

let CurrentSchedules = []
function sheduleGameSessionStart() {
    var task = cron.schedule(`*/${process.env.gameIntervalMinutes} * * * *`, async () =>  {
        try{
            if (params.gameTranslationSource) GameSessionMake({is_test: false});
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
