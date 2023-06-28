const mongoose = require("mongoose");
const { status } = require("./bet.constants");
const Schema = mongoose.Schema;

const BetSchema = new Schema(
  {
    multiplier:{
      type: Number,
      required: true,
      default: 1.02
    },
    is_won:{
      type:Boolean,
      default: false
    },
    is_auto_complete:{
      type: Boolean,
      required: true,
      default: false,
    },
    order: {
      type: Number,
      required: true,
    },
    value:{
      type: Number,
      required:true,
    },
    game_session: {
      type:mongoose.Types.ObjectId,
      ref:"GameSession",
      required: true,
    },
    is_removed: {
      type: Boolean,
      befault: false
    },
    user: {
      type:mongoose.Types.ObjectId,
      ref:"User",
      required: true,
    },
    transacted: {
      type: Boolean,
      required: false,
      default: false,
    },
    t:{
      type: Boolean,
      required: false,
    }
  },
  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("Bet", BetSchema);
