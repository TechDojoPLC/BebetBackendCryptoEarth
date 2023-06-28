const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { User, Wallet} = require("../../utils/dbs");
const localization = require("../../localizations/en.json");


async function Create(data) {
  const {_id} = data
  let user = await User.findOne({_id: _id})
  console.log(_id, user._id)
  if (!user){
    throw new Error(localization.ERRORS.USER.USER_DOES_NOT_EXIST)
  }
  let createdWallet = await Wallet.create({user: user._id})
  return createdWallet;
}
async function GetAll(data) {
  let user = await Wallet.find({})
  return user;
}

async function getMainWallet(req) {
  if (req.user){
    let wallet = await Wallet.findOne({user: req.user._id})
    if (wallet)
      return wallet;
  }
  throw new Error("No wallet for user")
}

async function GetAllByUser(data) {
  let user = await Wallet.find({})
  return user;
}

module.exports = {
  Create,
  GetAll,
  GetAllByUser,
  getMainWallet,
};
