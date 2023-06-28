const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { status } = require("./ref_transaction.constants")

const RefTransactionSchema = new Schema(
  {
    status: {
      type: String,
      required: false,
      enum: Object.keys(status),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ref_user:{
      type: Schema.Types.ObjectId,
      ref: "RefUser",
      required: false,
    },
    value: {
      type: Number,
      required: true,
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("RefTransaction", RefTransactionSchema);
