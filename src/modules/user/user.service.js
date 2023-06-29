const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { User, Wallet, RefUser, RefRefs, Bet} = require("../../utils/dbs");

const { messages } = require("../../utils/localization");

const { sendMessageToEmail } = require("../../utils/sendGrid");
const { saveFileToFolder } = require("../../utils/file/fileHelper");
const localization = require("../../utils/localization");
const { Create } = require("../wallet/wallet.service");
const { getRefUserDefended } = require("../ref_user/ref_user.service");
const { generatePassword } = require("../../utils/random");
function isEmail(email) {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== '' && email.match(emailFormat)) { return true; }
  
  return false;
}
async function Registrate(data) {
  const {email, password} = data
  if (!email || !password){
    throw new Error(localization.messages.ERRORS.USER.USER_IS_NOT_CONFIRMED)
  }
  let isExists = await User.exists({email: email})
  if (isExists){
    throw new Error(localization.messages.ERRORS.USER.USER_EMAIL_EXISTS)
  }
  if (!isEmail(email)){
    throw new Error(localization.messages.ERRORS.USER.EMAIL_IS_NOT_VALID)
  }
  if (password.length <= process.env.password_min_length || password.length >= process.env.password_max_length)
  {
    throw new Error(localization.messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
  }
  const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
  let enc = await bcrypt.hash(password, salt);
  let createdUser = await User.create({email: email, password: enc})
  let walletUser = await Create({_id: createdUser._id})
  if (data.ref_string){
    await RefConnectLocal({ref_string: data.ref_string, user_id: createdUser._id})
  }
  return true;
}
async function RegistrateViaVk(data) {
    const {vk_id} = data
    if (!vk_id){
      throw new Error(localization.messages.ERRORS.USER.USER_IS_NOT_CONFIRMED)
    }
    let isExists = await User.exists({vk_id: String(vk_id)})
    if (isExists){
      throw new Error(localization.messages.ERRORS.USER.USER_EMAIL_EXISTS)
    }
    let password = "no_password_test";
    let email = "no_email_test";
    const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
    let enc = await bcrypt.hash(password, salt);
    let createdUser = await User.create({email: email, password: enc, vk_id:String(vk_id)})
    let walletUser = await Create({_id: createdUser._id})
    if (data.ref_string){
      await RefConnectLocal({ref_string: data.ref_string, user_id: createdUser._id})
    }
    return createdUser;
}
async function Authorize(req) {
  return {token: req.token};
}
async function RefConnectLocal(data) {
  const {ref_string, user_id} = data
  if (!ref_string){
    throw new Error("No refer code")
  }
  let userReferend = await User.findOne({_id: user_id})
  let userRef = await RefRefs.findOne({ref_string: ref_string})
  if (!userRef){
    throw new Error("No ref found!")
  }
  let userReferrer = await getRefUserDefended({_id: userRef.user});
  if (!userReferend || !userReferrer) throw new Error("No users to connect")
  if (userReferend.refferend) throw new Error("User have connection")
  userReferend.refferend = userReferrer._id;
  userReferend.connection_date = new Date();
  await userReferend.save()
  return true
}
async function RefConnect(req) {
  const {ref_string} = req.body
  if (!ref_string){
    throw new Error("No refer code")
  }
  if (req.user){
    let userReferend = await User.findOne({_id: req.user._id})
    let userRef = await RefRefs.findOne({ref_string: ref_string})
    if (!userRef){
      throw new Error("No ref found!")
    }
    let userReferrer = await getRefUserDefended({_id: userRef.user})
    if (!userReferend || !userReferrer) throw new Error("No users to connect")
    if (userReferend.refferend) throw new Error("User have connection")
    userReferend.refferend = userReferrer._id;
    await userReferend.save()
    return true
  }
  throw new Error("No user found!")
}
async function GetCurrentUser(req) {
  if (req.user){
    return req.user
  }
  throw new Error("No user found!")
}
async function updateData(req) {
  if (req.user){
    const {email, name} = req.body
    let foundUser = await User.findOne({_id: req.user._id})
    if (email){
      if (foundUser.email !== email){
        let isExists = await User.exists({email: email})
        if (isExists){
          throw new Error(localization.messages.ERRORS.USER.USER_EMAIL_EXISTS)
        }
      }
      if (!isEmail(email)){
        throw new Error(localization.messages.ERRORS.USER.EMAIL_IS_NOT_VALID)
      }
      foundUser.email = email;
      await foundUser.save();
      req.user = foundUser;
    }
    if (name){
      if (name === ""){
        throw new Error(localization.messages.ERRORS.USER.NAME_IS_NOT_VALID)
      }
      foundUser.name = name;
      await foundUser.save();
      req.user = foundUser;
    }
    return foundUser;
  }
  throw new Error("No user found!")
}
async function updatePassword(req) {
  if (req.user){
    const {oldPassword, newPassword} = req.body
    if (oldPassword && newPassword){
      let foundUser = await User.findOne({_id: req.user._id})
      if (newPassword.length <= process.env.password_min_length || newPassword.length >= process.env.password_max_length)
      {
        throw new Error(localization.messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
      }
      let isOldValid = await bcrypt.compare(newPassword, foundUser.password);
      if (isOldValid){
        throw new Error(localization.messages.ERRORS.USER.NEW_PASSWORD_MUST_BE_DIFFERENT)
      }
      let isEq = await bcrypt.compare(oldPassword, foundUser.password)
      if (!isEq){
        throw new Error(localization.messages.ERRORS.USER.OLD_PASSWORD_IS_WRONG)
      }
      const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
      let enc = await bcrypt.hash(newPassword, salt);
      foundUser.password = enc;
      await foundUser.save();
      req.user = foundUser;
      return true;
    }
    throw new Error("No valid data provided!")
  }
  throw new Error("No user found!")
}
async function ForgotPassword(req) {
  if (req.user){
    const {oldPassword, newPassword} = req.body
    if (oldPassword && newPassword){
      let foundUser = await User.findOne({_id: req.user._id})
      let isOldValid = await bcrypt.compare(newPassword, foundUser.password);
      if (isOldValid){
        throw new Error(localization.messages.ERRORS.USER.NEW_PASSWORD_MUST_BE_DIFFERENT)
      }
      let isEq = await bcrypt.compare(oldPassword, foundUser.password)
      if (!isEq){
        throw new Error(localization.messages.ERRORS.USER.OLD_PASSWORD_IS_WRONG)
      }
      const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
      let enc = await bcrypt.hash(newPassword, salt);
      foundUser.password = enc;
      await foundUser.save();
      req.user = foundUser;
      return true;
    }
    throw new Error("No valid data provided!")
  }
  throw new Error("No user found!")
}
async function getUserDefended(req) {
  if (req.user){
    const {oldPassword, newPassword} = req.body
    if (oldPassword && newPassword){
      let foundUser = await User.findOne({_id: req.user._id})
      let isOldValid = await bcrypt.compare(newPassword, foundUser.password);
      if (isOldValid){
        throw new Error(localization.messages.ERRORS.USER.NEW_PASSWORD_MUST_BE_DIFFERENT)
      }
      let isEq = await bcrypt.compare(oldPassword, foundUser.password)
      if (!isEq){
        throw new Error(localization.messages.ERRORS.USER.OLD_PASSWORD_IS_WRONG)
      }
      const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
      let enc = await bcrypt.hash(newPassword, salt);
      foundUser.password = enc;
      await foundUser.save();
      req.user = foundUser;
      return true;
    }
    throw new Error("No valid data provided!")
  }
  throw new Error("No user found!")
}
async function CreateSimulateUser(data){
  const {email, password} = data
  if (!email || !password){
    throw new Error(localization.messages.ERRORS.USER.USER_IS_NOT_CONFIRMED)
  }
  let isExists = await User.exists({email: email})
  if (isExists){
    throw new Error(localization.messages.ERRORS.USER.USER_EMAIL_EXISTS)
  }
  if (password.length <= process.env.password_min_length || password.length >= process.env.password_max_length)
  {
    throw new Error(localization.messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
  }
  const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
  let enc = await bcrypt.hash(password, salt);
  let createdUser = await User.create({email: email, password: enc, t:true})
  let walletUser = await Create({_id: createdUser._id})
  return {1:createdUser,2:walletUser};
}
async function getUserStatistics(req) {
  if (req.user){
    let foundUser = await User.findOne({_id: req.user._id})
    let stat = {}
    stat.summary_won = 0
    stat.max_value_won = 0
    stat.max_multiplier_won = 0
    stat.summary_game_sessions = 0;

    let max_value_wons = await Bet.find({user: foundUser._id, is_won: true}).sort({value: -1})
    if (max_value_wons.length > 0)
      stat.max_value_won = max_value_wons[0].value;
    let summary_wons = await Bet.find({user: foundUser._id, is_won: true}).sort({result: -1})
    if (summary_wons.length > 0){
      for (let i = 0; i < summary_wons.length; i++){
        if (summary_wons[0].result)
          stat.summary_won += summary_wons[0].result;
      }
    }

    let max_multiplier_wons = await Bet.find({user: foundUser._id, is_won: true}).sort({multiplier: -1})
    if (max_multiplier_wons.length > 0)
      stat.max_multiplier_won = max_multiplier_wons[0].multiplier;
    let allBets = await Bet.find({user: foundUser._id}).distinct("game_session")
    if (allBets.length > 0) {
      stat.summary_game_sessions = allBets.length;
    }
    return stat;
  }
  throw new Error("No user found!")
}
module.exports = {
  updatePassword,
  updateData,
  GetCurrentUser,
  Registrate,
  Authorize,
  RefConnect,
  CreateSimulateUser,
  getUserDefended,
  RegistrateViaVk,
  getUserStatistics,
};