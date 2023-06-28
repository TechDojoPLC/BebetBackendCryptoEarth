const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {status} = require("./ref_refs.constants")

const RefRefsSchema = new Schema(
  {
    user:{
      type: mongoose.Types.ObjectId,
      ref: "RefUser",
      required: true
    },
    name: {
      type: String,
      default: false,
      required: true,
    },
    description: {
      type: String,
      default: false,
      required: true,
    },
    adress: {
      type: String,
      default: false,
      required: true,
    },
    traffic: {
      type: Number,
      default: 0
    },
    ref_string:{
      type: String,
      required: true,
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("RefRefs", RefRefsSchema);
