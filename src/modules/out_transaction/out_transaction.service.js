const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { RefUser, OutTransaction} = require("../../utils/dbs");
const { messages } = require("../../utils/localization");

const localization = require("../../localizations/en.json");
const { status } = require("./out_transaction.constants");

async function requestOut(req) {
  if (req.user){
    const {value} = req.body
    if (!value){
      throw new Error()
    }
    let nRefTrans = await OutTransaction.create({status: status.open, email: email, ref_user: req.user._id, value: value})
    return nRefTrans;
  }
  throw new Error(localization.ERRORS.AUTH.UNAUTHORIZED)
  
}
async function getAllRequests(req) {
  if (req.user){
    let nRefTrans = await OutTransaction.find({ref_user: req.user._id})
    return nRefTrans;
  }
  throw new Error(localization.ERRORS.AUTH.UNAUTHORIZED)
}
async function completeAllRequests(req) {
  const {ref_user_id} = req.body
  if (!ref_user_id){
    throw new Error("")
  }
  let refUser = await RefUser.findOne({_id: ref_user_id})
  if (!refUser){
    throw new Error("")
  }
  let nRefTrans = await OutTransaction.find({ref_user: req.user._id, status: status.open})
  for (let i = 0; i < nRefTrans.length; i++){
    // PaymentMagic

    nRefTrans[i].status = status.done
  }
  return true;
  //throw new Error(localization.ERRORS.AUTH.UNAUTHORIZED)
}
module.exports = {
  requestOut,
  getAllRequests,
  completeAllRequests,
};
