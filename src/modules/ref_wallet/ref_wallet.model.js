const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {status} = require("./ref_wallet.constants")

const RefWalletSchema = new Schema(
  {
    user:{
      type: mongoose.Types.ObjectId,
      ref: "RefUser",
      required: true
    },
    currency:{
      type: String,
      required: false,
      default: "$"
    },
    value: {
      type: Number,
      required: false,
      default: 0
    },
    status: {
      type: String,
      required: false,
      enum: Object.keys(status),
      default: status.open
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("RefWallet", RefWalletSchema);
