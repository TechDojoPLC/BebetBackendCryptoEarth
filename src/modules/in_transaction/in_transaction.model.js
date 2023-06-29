const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { statuses } = require("./in_transaction.constants")

const InTransactionSchema = new Schema(
  {
    status: {
      type: String,
      required: false,
      enum: Object.keys(statuses),
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
      required: true
    },
    countryCode: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true
    },
    open_key: {
      type: String,
      required: true,
    },
    private_key: {
      type: String,
      required: true,
    },
    order_id: {
      type: Number,
      required: false,
    },
    row_data: {
      type: String,
      required: false,
    },
    current_responce: {
      type: String,
      required: false,
    },
    payment_url: {
      type: String,
      required: false,
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("InTransaction", InTransactionSchema);
