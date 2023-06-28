const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    nickname: {
      type: String,
      require: false,
    },
    name: {
      type: String,
      require: false,
    },
    email:{
      type:String,
      require:true
    },
    password:{
      type:String,
      require:true
    },
    status:{
      type:String,
      require:false,
    },
    phone:{
      type:String,
      require:false,
    },
    is_removed:{
      type: Boolean,
      default: false
    },
    refferend:{
      type: mongoose.Types.ObjectId,
      ref: "RefUser",
      default: undefined,
      required: false,
    },
    connection_date: {
      type: Date,
      required: false,
    },
    vk_id: {
      type: String,
      required: false,
    },
    vk_access_token: {
      type: String,
      required: false,
    },
    t:{
      type: Boolean,
      required: false,
    }
  }  ,  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
