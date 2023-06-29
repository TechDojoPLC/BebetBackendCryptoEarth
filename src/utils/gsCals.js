const mongoose = require("mongoose");
const { Bet, Bank, User } = require("./dbs");
const { params } = require("./globals");
const { log } = require("./debug");

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
const median = arr => {
    const mid = Math.floor(arr.length / 2)
    return mid
};
const calculateOutcome = (arr, mult) => {
    let summaryOutcome = 0
    arr.map((item)=>{
        if (item.multiplier <= mult)
            summaryOutcome += item.outcome
    })
    return summaryOutcome
}
const countMultiplier = arr => {
    let cur = 0
    let summaryOutcome = 0
    arr.map((item)=>{
        summaryOutcome += item.outcome
    })
    let maxOutcome = summaryOutcome * 0.10;
    let curOutcomeCalculated = 0;
    while(true){
        curOutcomeCalculated = calculateOutcome(arr, cur)
        let delta = Math.random()/10
        cur += delta;
        if (curOutcomeCalculated >= maxOutcome){
            cur -= delta;
            curOutcomeCalculated = calculateOutcome(arr, cur)
            break;
        }
    }
    console.log(`max OC ${maxOutcome} endOC ${curOutcomeCalculated}`)
    return cur
};
const calcOutcome = arr => {
    let res = []
    arr.map((item)=>{
        if (item.is_auto_complete){
            let betData = {}
            betData.multiplier = Number(item.multiplier);
            betData.value = Number(item.value)
            betData.outcome = Number(item.multiplier) * Number(item.value)
            res.push(betData)
        }
    })
    res = res.sort((a, b) => a.outcome < b.outcome ? 1 : -1);
    return res
};
const calcOutcomeFull = arr => {
    let res = []
    arr.map((item)=>{
        if (item.is_auto_complete){
            let betData = {}
            betData.multiplier = Number(item.multiplier);
            betData.value = Number(item.value)
            betData.outcome = Number(item.multiplier) * Number(item.value)
            res.push(betData)
        }
        else{
            let betData = {}
            betData.multiplier = Number(20);
            betData.value = Number(item.value)
            betData.outcome = Number(20) * Number(item.value)
            res.push(betData)
        }
    })
    res = res.sort((a, b) => a.outcome > b.outcome ? 1 : -1);
    return res
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
    //console.log("Banks :" + " " + mainBank.value)
    if (params.currentGameSession){
        let bets = await Bet.find({game_session: params.currentGameSession._id}).sort({multiplier: -1})
        let realBets = []
        for (let i = 0; i < bets.length; i++){
            let u = await User.findOne({_id: bets[i].user, t: false})
            if (u){
                realBets.push(bets[i])
            }
        }
        let calcData = calcOutcomeFull(realBets);
        //let medianCur = median(calcData)
        log(calcData, "game_session")
        /*
        let max_time = getRandomArbitrary(0.0, 15);
        if (is_test){
            max_time = getRandomArbitrary(0.0, 15);
        }
        */
        let max_time = 0
        let medianMult = countMultiplier(calcData)
        if (medianMult > 20)
        {
            medianMult = 20;
        }
        if (medianMult < 0){
            medianMult = 1;
        }
        if (realBets.length === 0){
            medianMult = getRandomArbitrary(100,2000)/100
        }
        if (realBets.length === 1){
            if (getRandomArbitrary(0,100) > 80)
            {
                if (realBets[0].is_auto_complete){
                    medianMult = realBets[0].multiplier - 1
                }else{
                    medianMult = getRandomArbitrary(100,2000)/100
                }
                if (medianMult < 0){
                    medianMult = 1;
                }
            }
            else{
                medianMult = 1;
            }
        }
        let speed = 1;
        let step = speed/(Number(interval));
        max_time = medianMult
        //let step = ((medianMult - 1.02)/max_time)/((1000)/(Number(interval)));
        if (getRandomArbitrary(0.0, 10) >= 9){
            max_time = 0
        }
        params.currentGameSession.max_multiplier = medianMult;
        params.currentGameSession.max_time = max_time
        params.currentGameSession.step = step
        return {max_time: max_time, max_multiplier: medianMult, step: step};
    }
}
module.exports = {
    calcGS2,
};