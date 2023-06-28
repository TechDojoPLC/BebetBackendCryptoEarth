const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { User, Wallet, RefUser, RefRefs} = require("../../utils/dbs");

const { messages } = require("../../utils/localization");

const { sendMessageToEmail } = require("../../utils/sendGrid");
const { saveFileToFolder } = require("../../utils/file/fileHelper");
const localization = require("../../utils/localization");
const { Create } = require("../wallet/wallet.service");
const { getRefUserDefended } = require("../ref_user/ref_user.service");
const { generatePassword } = require("../../utils/random");

async function Registrate(data) {
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
    if (email && name){
      let foundUser = await User.findOne({_id: req.user._id})
      foundUser.email = email;
      foundUser.name = name;
      await foundUser.save();
      req.user = foundUser;
      return true;
    }
    throw new Error("No valid data provided!")
  }
  throw new Error("No user found!")
}
async function updatePassword(req) {
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
};