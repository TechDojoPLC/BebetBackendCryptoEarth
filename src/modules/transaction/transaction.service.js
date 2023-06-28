const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { Transaction, User, RefUser} = require("../../utils/dbs");
const { messages } = require("../../utils/localization");

const localization = require("../../localizations/en.json");
const { status } = require("./transaction.constants");
const { getRefUserDefended } = require("../ref_user/ref_user.service");

async function Create({user_id, order}) {
  if (game_session){
    let curTrans = await Transaction.create({user: user_id, status: status.open, game_session: game_session})
    return curTrans
  }
  let curTrans = await Transaction.create({user: user_id, status: status.open, game_session: null})
  return curTrans
}
async function Create2({user_id, value, game_session_id}) {
  if (game_session_id){
    let curTrans = await Transaction.create({user: user_id, status: status.open, game_session: game_session_id, value: value})
    return curTrans
  }
  let curTrans = await Transaction.create({user: user_id, status: status.open, game_session: null, value: value})
  return curTrans
}

async function Start({transaction_id}){
  let curTrans = await Transaction.findOne({_id: transaction_id})

}
async function GetAllByUser(req) {
  if (req.user){
    let curTrans = await Transaction.find({user: req.user._id})
    return curTrans
  }
  return []
}

module.exports = {
  Create,
  Start,
  GetAllByUser,
  Create2
};
