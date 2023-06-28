const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { status } = require("./transaction.constants")

const TransactionSchema = new Schema(
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
    value: {
      type: Number,
      required: false,
    },
    game_session: {
      type: Schema.Types.ObjectId,
      ref: "GameSession",
      required: false,
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
