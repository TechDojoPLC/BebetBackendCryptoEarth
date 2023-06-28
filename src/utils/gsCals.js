const mongoose = require("mongoose");
const { Bet, Bank } = require("./dbs");
const { params } = require("./globals");

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
const median = arr => {
    const mid = Math.floor(arr.length / 2)
    return mid
};
const calcGS1 = async () => {
    let banks = await Bank.find({})
    let mainBank = banks[0]
    if (params.currentGameSession){
        let bets = await Bet.find({game_session: params.currentGameSession._id})
        let maxLost = 0
        let currentBankValue = mainBank.value;
        let maxMult = 50;
        for (let i = 0; i < bets.length; i++){
            bets[i].maxLost = bets[i].value * bets[i].multiplier;
            maxLost += bets[i].value * bets[i].multiplier;
        }
        function compare( a, b ) {
            if ( a.multiplier < b.multiplier ){
              return -1;
            }
            if ( a.multiplier > b.multiplier ){
              return 1;
            }
            return 0;
        }
        bets.sort( compare );
        while (currentBankValue/2 < maxLost){
            maxLost = 0;
            maxMult = bets[bets.length-1]
        }

    }
}
const calcGS2 = async ({interval, is_test}) => {
    let banks = await Bank.find({})
    let mainBank = banks[0]
    console.log("Banks :" + " " + mainBank.value)
    if (params.currentGameSession){
        let bets = await Bet.find({game_session: params.currentGameSession._id}).sort({multiplier: -1})
        let currentBankValue = mainBank.value;
        let maxMult = 50;
        let medianCur = median(bets)
        let max_time = getRandomArbitrary(0.5, 5);
        if (is_test){
            max_time = getRandomArbitrary(4, 16);
        }
        let medianMult = bets[medianCur].multiplier;
        let step = ((medianMult - 1.02)/max_time)/((1000)/(Number(interval)));
        params.currentGameSession.max_multiplier = medianMult;
        params.currentGameSession.max_time = max_time
        params.currentGameSession.step = step
        return {max_time: max_time, max_multiplier: medianMult, step: step};
    }
}
module.exports = {
    calcGS2,
};