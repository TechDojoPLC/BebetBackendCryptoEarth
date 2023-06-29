const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { status } = require("./out_transaction.constants")

const OutTransactionSchema = new Schema(
  {
    status: {
      type: String,
      required: false,
      defaut: status.open,
      enum: Object.keys(status),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: false,
      default: "RUB"
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("OutTransaction", OutTransactionSchema);
