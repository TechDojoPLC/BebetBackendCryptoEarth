const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { status } = require("./out_ref_transaction.constants")

const OutRefTransactionSchema = new Schema(
  {
    status: {
      type: String,
      required: false,
      defaut: status.open,
      enum: Object.keys(status),
    },
    ref_user: {
      type: Schema.Types.ObjectId,
      ref: "RefUser",
      required: true,
    },
    email: {
      type: String,
      required: true,
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

module.exports = mongoose.model("OutRefTransaction", OutRefTransactionSchema);
