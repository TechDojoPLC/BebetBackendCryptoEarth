const {
  Types: { ObjectId },
} = require("mongoose");

const {
  auth,
  server: { fullBaseUrl, clientUrl },
} = require("../../config");
const localization = require("../../localizations/en.json");

const { GameSession, Bet, User, Wallet, Bank, RefUser, RefWallet } = require("../../utils/dbs");
const { status } = require("../game_session/game_session.constants");
const { params } = require("../../utils/globals");
const { getRefUserDefended } = require("../ref_user/ref_user.service");
const { getUserDefended } = require("../user/user.service");
const refTransactionService = require("../ref_transaction/ref_transaction.service")
const transactionService = require("../transaction/transaction.service");
const { log } = require("../../utils/debug");


const sendWebSocketMessage = (wsClient, content) => {
  if (wsClient) wsClient.send(JSON.stringify(content));
}


const Create = async ({game_session_id, user_id,value,multiplier, is_auto_complete,order}) => {
  try{
    let foundGameSession = await GameSession.findOne({_id: game_session_id})
    if (!foundGameSession){
      throw new Error(localization.ERRORS.GAME_SESSION.GAME_SESSION_NOT_FOUND)
    }
    let foundUser = await User.findOne({_id: user_id})
    if (!foundUser){
      throw new Error(localization.ERRORS.USER.USER_DOES_NOT_EXIST)
    }
    let wallet = await Wallet.findOne({user: foundUser._id})
    if (!wallet){
      throw new Error(localization.ERRORS.WALLET.WALLET_NOT_FOUND);
    }
    if (wallet){
      if (wallet.value - value < 0){
        throw new Error(localization.ERRORS.WALLET.NOT_ENOUGHT_POINTS)
      }
      wallet.value -= value;
      await wallet.save();
    }
    let bets = await Bet.findOne({user: foundUser._id, game_session: foundGameSession._id, is_auto_complete: is_auto_complete, order: order})
    if (!bets){
      let newBet = await Bet.create({value: value, multiplier: multiplier, user: foundUser._id, game_session: foundGameSession._id, is_auto_complete: is_auto_complete, order: order})
      return newBet;
    }
    throw new Error(`Bet ${order} is already made`)
  }catch(e){
    console.log(e)
    return null
  }

}
const AddBank = async ({value}) => {
  const bank = await Bank.find({})
  let mainBank = bank[0]
  mainBank.value += value;
  await mainBank.save();
  return true;
}
const DiffBank = async ({value}) => {
  const bank = await Bank.find({})
  let mainBank = bank[0]
  mainBank.value -= value;
  await mainBank.save();
  return true;
}

const GiveToReferend = async ({user_id, value}) => {
  let user = await User.findOne({_id: user_id})
  if (user.refferend){
    let userRef = await getRefUserDefended({_id: user.refferend}) 
    if (userRef){
      let urWallet = await RefWallet.findOne({user: userRef._id})
      if (urWallet){
        urWallet.value += ( Number(process.env.percentToRef) * value)
        await urWallet.save();
        await DiffBank({value: (Number(process.env.percentToRef)) * value})
        await refTransactionService.Create2({user_id: user._id, ref_user_id: userRef._id, value: (Number(process.env.percentToRef)) * value})
      }
    }
  }
}
const CompleteBets = async ({game_session_id}) => {
  let testBank = 0;
  let foundGameSession = await GameSession.findOne({_id: game_session_id})
  let usersWon = []
  let usersLose = []
  if (foundGameSession){
    let bets = await Bet.find({game_session: foundGameSession._id})
    for(let i = 0; i < bets.length; i ++){
      let foundUser = await User.findOne({_id: bets[i].user})
      if (bets[i].is_auto_complete)
      {
        if (bets[i].multiplier <= foundGameSession.current_multiplier){
          bets[i].is_won = true;
          testBank -= (bets[i].value * bets[i].multiplier) - bets[i].value
          if (bets[i].transacted === false){
            usersWon.push({user:foundUser._doc, bet: bets[i]._doc})
            if (!foundUser.t){
              let wallet = await Wallet.findOne({user: foundUser._id})
              if (wallet){
                wallet.value = wallet.value + Number(bets[i].value) * Number(bets[i].multiplier)
                await wallet.save();
                bets[i].transacted = true;
                bets[i].result = Number(bets[i].value) * Number(bets[i].multiplier)
                await transactionService.Create2({user_id: foundUser._id, value: Number(bets[i].value) * Number(bets[i].multiplier), game_session_id: foundGameSession._id})
                await DiffBank({value: Number(bets[i].value) * Number(bets[i].multiplier)})
              }
            }
          }
          await bets[i].save();
        }else{
          usersLose.push({user:foundUser._doc, bet: bets[i]._doc})
          testBank += (bets[i].value * bets[i].multiplier)
          if (!foundUser.t)
          {
            let wallet = await Wallet.findOne({user: foundUser._id})
            if (wallet){
              wallet.value = wallet.value - Number(bets[i].value)
              await wallet.save();
              bets[i].transacted = true;
              await bets[i].save()
              await transactionService.Create2({user_id: foundUser._id, value: (-Number(bets[i].value)), game_session_id: foundGameSession._id})
              await AddBank({value: Number(bets[i].value)})
              await GiveToReferend({user_id: foundUser._id, value: bets[i].value})
            }
          }
        }
      }else{
        /*
        bets[i].is_won = true
        bets[i].multiplier = foundGameSession.current_multiplier
        if (bets[i].is_won){
          usersWon.push({user:foundUser._doc, bet: bets[i]._doc})
          testBank -= (bets[i].value * bets[i].multiplier) - bets[i].value
        }else{
          usersLose.push({user:foundUser._doc, bet: bets[i]._doc})
          testBank += (bets[i].value * bets[i].multiplier)
        }
        */
      }

    }
    foundGameSession.status = status.paided;
    console.log(testBank)
    await foundGameSession.save();
  }
  return {usersWon: usersWon, usersLose: usersLose};
}
const CompleteBet = async ({bet_id, game_session_id, is_won}) => {
  let bet = await Bet.findOne({_id: bet_id})
  if (!bet)
  {
    throw new Error()
  }
  let foundGameSession = await GameSession.findOne({_id: game_session_id})
  if (!foundGameSession){
    throw new Error(localization.ERRORS.GAME_SESSION.GAME_SESSION_NOT_FOUND)
  }
  let user = await User.findOne({_id: bet.user})
  //if (is_won){
  bet.is_won = true;
  if (bet.transacted === false){
    let wallet = await Wallet.findOne({user: user._id})
    if (wallet){
      let mult = params.currentGameSession.current_multiplier
      wallet.value = wallet.value + Number(bet.value) * Number(mult)
      await wallet.save();
      bet.multiplier = mult;
      bet.result = Number(bet.value) * Number(mult)
      bet.transacted = true;
      await bet.save()
      await transactionService.Create2({user_id: user._id, value: Number(bet.value) * Number(mult), game_session_id: foundGameSession._id})
      await DiffBank({value: Number(bet.value) * Number(mult)})
    }
    //}
  }
  await bet.save()
  return bet;
}
const GetAll = async ({}) => {
  const foundBets = await Bet.find({})
  const res = []
  for (let i = 0; i < foundBets.length; i++){
    let bres = {}
    Object.assign(bres, foundBets[i]._doc)
    let user = await getUserDefended({_id: foundBets[i].user})
    if (user){
      bres.userObj = {name: user.name, _id: user._id}
    }
    res.push(bres)
  }
  return res
}
const GetAllWithCount = async ({count}) => {
  const foundBets = await Bet.find({}).sort({createdAt: -1}).limit(Number(count))
  const res = []
  for (let i = 0; i < foundBets.length; i++){
    let bres = {}
    Object.assign(bres, foundBets[i]._doc)
    let user = await User.findOne({_id: foundBets[i].user})
    if (user){
      bres.userObj = {name: user.name, _id: user._id}
    }
    res.push(bres)
  }
  return res
}
const GetAllTopWithCount = async ({count}) => {
  const foundBets = await Bet.find({is_won: true}).sort({result: -1}).limit(Number(count))
  const res = []
  for (let i = 0; i < foundBets.length; i++){
    let bres = {}
    Object.assign(bres, foundBets[i]._doc)
    let user = await User.findOne({_id: foundBets[i].user})
    if (user){
      bres.userObj = {name: user.name, _id: user._id}
    }
    res.push(bres)
  }
  return res
}

const GetAllByCurrentGame = async () => {
  if (!params.currentGameSession){
    throw new Error("No game playing curent")
  }
  const foundBets = await Bet.find({game_session: params.currentGameSession._id})
  const res = []
  for (let i = 0; i < foundBets.length; i++){
    let bres = {}
    Object.assign(bres, foundBets[i]._doc)
    let user = await User.findOne({_id: foundBets[i].user})
    if (user){
      bres.userObj = {name: user.name, _id: user._id}
    }
    res.push(bres)
  }
  return res
}
const GetAllByUserIdCount = async (req,count) => {
  let _id = req.user._id
  const foundBets = await Bet.find({user: _id}).limit(Number(count))
 return foundBets;
}
const GetAllByUserId = async (req) => {
  let _id = req.user._id
  const foundBets = await Bet.find({user: _id})
 return foundBets;
}
const GetAllByGameId = async ({_id}) => {
  const foundBets = await Bet.find({game_session: _id})
  return foundBets
}
const Update = async (req) => {
  const _id = req.params.id;
  const foundBet = await Bet.findOne({_id: _id})
  if (!foundBet){
    throw new Error()
  }

  await foundBet.save()
  return true
}
const CreateVirtualBet = async ({game_session_id, user_id,value,multiplier, is_auto_complete, order}) => {
  try{
    let foundGameSession = await GameSession.findOne({_id: game_session_id})
    if (!foundGameSession){
      throw new Error(localization.ERRORS.GAME_SESSION.GAME_SESSION_NOT_FOUND)
    }
    let foundUser = await User.findOne({_id: user_id, t: true})
    if (!foundUser){
      throw new Error(localization.ERRORS.USER.USER_DOES_NOT_EXIST)
    }
    let wallet = await Wallet.findOne({user: foundUser._id})
    if (!wallet){
      throw new Error(localization.ERRORS.WALLET.WALLET_NOT_FOUND);
    }
    let bets = await Bet.findOne({user: foundUser._id, game_session: foundGameSession._id, is_auto_complete: is_auto_complete})
    if (!bets){
      let newBet = await Bet.create({value: value, multiplier: multiplier, user: foundUser._id, game_session: foundGameSession._id, is_auto_complete: is_auto_complete, order: order})
      //console.log({value: value, multiplier: multiplier, user: foundUser._id, game_session: foundGameSession._id, is_auto_complete: is_auto_complete})
      for(let i = 0; i < params.UsersInGame.length; i++){
        sendWebSocketMessage(params.UsersInGame[i], {type: "refresh_bets"})
      }
      return newBet;
    }
    throw new Error("Bet is already made")
  }catch(e){
    console.log(e)
    return null;
  }
}
const Delete = async (req) => {
  const _id = req.params.id;
  const foundBet = await Bet.findOne({_id: _id})
  if (!foundBet){
    throw new Error()
  }
  foundBet.is_removed = true;
  await foundBet.save();
  return true;
}
module.exports = {
  Create,
  GetAll,
  Update,
  Delete,
  GetAllByUserId,
  GetAllByGameId,
  CompleteBets,
  CompleteBet,
  GetAllWithCount,
  GetAllByUserIdCount,
  GetAllByCurrentGame,
  CreateVirtualBet,
  GetAllTopWithCount,
};
