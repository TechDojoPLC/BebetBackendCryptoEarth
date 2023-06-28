const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { auth } = require("../../config");
const { devicePlatforms } = require("../../config");

const AuthSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: auth.tokenLife,
      required: true,
    },
  },
  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("Auth", AuthSchema);
