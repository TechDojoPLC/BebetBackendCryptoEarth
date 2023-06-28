const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { RefOutTransaction, RefUser} = require("../../utils/dbs");
const { messages } = require("../../utils/localization");

const localization = require("../../localizations/en.json");
const { status } = require("./out_ref_transaction.constants");

async function requestOut(req) {
  if (req.user){
    const {email, value} = req.body
    if (!email || !value){
      throw new Error()
    }
    if (email != req.user.email){
      throw new Error();
    }
    let nRefTrans = await RefOutTransaction.create({status: status.open, email: email, ref_user: req.user._id, value: value})
    return true;
  }
  throw new Error(localization.ERRORS.AUTH.UNAUTHORIZED)
  
}
async function getAllRequests(req) {
  if (req.user){
    let nRefTrans = await RefOutTransaction.find({ref_user: req.user._id})
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
  let nRefTrans = await RefOutTransaction.find({ref_user: req.user._id, status: status.open})
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
