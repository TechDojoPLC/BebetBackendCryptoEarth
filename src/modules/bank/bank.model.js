const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {status} = require("./bank.constants")

const BankSchema = new Schema(
  {
    currency:{
      type: String,
      required: false,
      default: "$"
    },
    value: {
      type: Number,
      required: false,
      default: 1000000
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Bank", BankSchema);
