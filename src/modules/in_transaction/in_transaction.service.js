const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetch = require('node-fetch') ;

const {
  Types: { ObjectId },
} = require("mongoose");

const { InTransaction, User} = require("../../utils/dbs");
const { messages } = require("../../utils/localization");

const localization = require("../../localizations/en.json");
const { statuses } = require("./in_transaction.constants");
const { getMainWallet } = require("../wallet/wallet.service");

async function Create({user_id}) {
  let curTrans = await InTransaction.create({user: user_id, status: status.open, game_session: null})
  return curTrans
}
async function createPaymentUrl(req) {
  if (req.user){
    let user = req.user
    const {amount, ip, countryCode} = req.body
    if (amount && ip && countryCode){
      let token = process.env.payPortToken
      let date = new Date();
      let curTrans = await InTransaction.create({user: user._id, status: status.open, currency: "RUB", value: amount, open_key: "test", private_key: "test", ip: ip, countryCode: countryCode})
      let count = await InTransaction.countDocuments() +1
      curTrans.order_id = count;
      let data = {
        order_id: count, 
        amount: amount, 
        currency: "RUB",
        customer_id: `${count}`,
        server_url: process.env.paymentServerURL,
        merchant_server_url: process.env.paymentServerURL,
        order_desc: `${curTrans._id}`,
        merchant_cancel_url: process.env.paymentServerURLCancel,
        countryCode: countryCode,
      }
      curTrans.row_data = JSON.stringify(data);
      await curTrans.save()
      const response = await fetch('https://sandbox.operatorsenter.online/api/v5/invoice/get', {method: 'post', body: JSON.stringify(data), headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
      const bodyT = await response.text();
      curTrans.current_responce = bodyT;
      const jsonBody = await JSON.parse(bodyT)
      curTrans.payment_url = jsonBody.url;
      return {url: curTrans.payment_url}
    }  
    throw new Error("")
  }
  throw new Error("")
}

async function GetAllByUser(req) {
  if (req.user){
    let curTrans = await Transaction.find({user: req.user._id})
    return curTrans
  }
  return []
}
async function Callback(req) {
  const {order_desc, status, fiat_amount} = req.body
  if (status == -1){
    throw new Error("Status is -1")
  }
  if (order_desc){
    if (fiat_amount){
      let t = await InTransaction.findOne({_id: order_desc})
      if (t.status === "open"){
        let u = await User.findOne({_id: t.user})
        if (!u) throw new Error("")
        let w = await getMainWallet({user: u})
        if (!w) throw new Error("")
        w.value += Number(fiat_amount)
        t.status === statuses.done
        await t.save();
        await w.save();
        }
      }
    }
  return true
}
async function CallbackCancel(req) {
  const {order_desc, status, fiat_amount} = req.body
  if (status == 1){
    throw new Error("Status is 1")
  }
  if (order_desc){
    let t = await InTransaction.findOne({_id: order_desc})
    if (t.status === "open"){
      t.status === statuses.error
      await t.save();
      }
    }
  return true;
}
module.exports = {
  Create,
  GetAllByUser,
  createPaymentUrl,
  Callback,
  CallbackCancel
};
