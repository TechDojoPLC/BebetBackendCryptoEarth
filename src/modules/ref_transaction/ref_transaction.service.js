const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { RefTransaction, User, RefUser} = require("../../utils/dbs");
const { messages } = require("../../utils/localization");

const localization = require("../../localizations/en.json");
const { status } = require("./ref_transaction.constants");
const { getRefUserDefended } = require("../ref_user/ref_user.service");

async function Create({user_id, order}) {
  let curTrans = await RefTransaction.create({user: user_id, status: status.open, game_session: game_session})
  return curTrans
}
async function Create2({user_id, ref_user_id, value}) {
  let curTrans = await RefTransaction.create({user: user_id, status: status.open, value: value, ref_user: ref_user_id})
  return curTrans
}
async function Start({transaction_id}){
  let curTrans = await RefTransaction.findOne({_id: transaction_id})

}

async function GetAllByUser(req) {
  if (req.user){
    let curTrans = await RefTransaction.find({ref_user: req.user._id})
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
