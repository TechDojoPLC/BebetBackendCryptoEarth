const mongoose = require("mongoose");
const { status } = require("./game_session.constants");
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema(
  {
    current_multiplier:{
      type: Number,
      required: true,
      default: 1.0
    },
    status: {
      type: String,
      required: true,
      enum: Object.keys(status),
    },
    is_removed: {
      type: Boolean,
      default: false,
    },
    start_date:{
      type: Date,
      required: false,
    },
    end_date:{
      type: Date,
      required: false,
    },
  },
  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("GameSession", GameSessionSchema);
