const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const {  RefUser, RefRefs, RefReferenceTrack} = require("../../utils/dbs");
const localization = require("../../localizations/en.json");


async function Create(req) {
  if (req.user){
    const {name, description, adress} = req.body
    if (!name || !description || !adress){
      throw new Error("No data for ref provided!")
    }
    let foundRefs = await RefRefs.find({ref_user: req.user._id})
    let foundUser = await RefUser.findOne({_id: req.user._id})
    let count = foundRefs.length;
    let dat = {
      user: req.user._id,
      name: name, 
      description: description,
      adress: adress,
      ref_string: (foundUser.ref_string+ "_" + count)
    }
    let nRef = await RefRefs.create(dat);
    return nRef
  }
  throw new Error("No user");
}
async function GetAll(data) {
  let user = await RefRefs.find({})
  return user;
}

async function GetByCurrentUser(req) {
  if (req.user){
    let refs = await RefRefs.find({user: req.user._id})
    return refs;
  }
  throw new Error("No User")
}

async function CatchTraffic(req) {
  const {ref_param} = req.body
  if (!ref_param){
    throw new Error("No ref provided!")
  }
  let foundRef = await RefRefs.findOne({ref_string: ref_param})
  if (!foundRef){
    throw new Error("No ref found!")
  }
  foundRef.traffic += 1;
  let newRefTrack = await RefReferenceTrack.create({ref_refs_id: foundRef._id})
  await foundRef.save();
  return true;
}
module.exports = {
  Create,
  GetAll,
  GetByCurrentUser,
  CatchTraffic,
};
