const mongoose = require("mongoose");
const { partnershipTypes, communicationTypes } = require("./ref_user.constants");
const Schema = mongoose.Schema;

const RefUserSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email:{
      type:String,
      require:true
    },
    partnershipType: {
      type:String,
      enum: Object.keys(partnershipTypes),
      require:true
    },
    communicationType: {
      type:String,
      enum: Object.keys(communicationTypes),
      require:true
    },
    promocode:{
      type:String,
      require:false,
    },
    reference:{
      type:String,
      require: false,
    },
    trafficSource:{
      type:String,
      require:true,
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
    ref_string:{
      type: String,
      default: "test",
      require: true,
    }
  }  ,  { timestamps: true }
);

module.exports = mongoose.model("RefUser", RefUserSchema);
