const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { codeLifeTime } = require("./confirmation.constants");

const ConfirmationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: codeLifeTime,
      required: true,
    },
  }  ,  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("Confirmation", ConfirmationSchema);
