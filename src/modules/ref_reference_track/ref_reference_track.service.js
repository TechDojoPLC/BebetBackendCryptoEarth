const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { RefReferenceTrack} = require("../../utils/dbs");

async function Create({user_id, ref_user_id, ref_refs_id}) {
  let curTrans = await RefReferenceTrack.create({ref_ref: ref_refs_id})
  return curTrans
}


module.exports = {
  Create,
};
