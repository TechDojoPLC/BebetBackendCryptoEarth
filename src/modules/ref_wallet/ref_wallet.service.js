const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const {  RefUser, RefWallet} = require("../../utils/dbs");
const localization = require("../../localizations/en.json");
const { getRefUserDefended } = require("../ref_user/ref_user.service");


async function Create(data) {
  const {_id} = data
  let user = await RefUser.findOne({_id: _id})
  if (!user){
    throw new Error(localization.ERRORS.USER.USER_DOES_NOT_EXIST)
  }
  let createdWallet = await RefWallet.create({user: user._id})
  return createdWallet;
}
async function GetAll(data) {
  let user = await RefWallet.find({})
  return user;
}

async function getMainWallet(req) {
  if (req.user){
    let wallet = await RefWallet.findOne({user: req.user._id})
    if (wallet)
      return wallet;
  }
  throw new Error("No wallet for user")
}

async function GetAllByUser(data) {
  let user = await RefWallet.find({})
  return user;
}

module.exports = {
  Create,
  GetAll,
  GetAllByUser,
  getMainWallet,
};
