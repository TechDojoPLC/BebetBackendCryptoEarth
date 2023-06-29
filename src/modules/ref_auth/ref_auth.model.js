const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { auth } = require("../../config");
const { devicePlatforms } = require("../../config");

const RefAuthSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "RefUser",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: process.env.tokenLife,
      required: true,
    },
  },
  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("RefAuth", RefAuthSchema);
