const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingsSchema = new Schema(
  {
    max_multiplier:{
      type: Number,
      required: true,
      default: 20.0
    },
    min_multiplier:{
      type: Number,
      required: true,
      default: 1.0,
    },
    speed:{
      type: Number,
      required: true,
      default: 1.0,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: false,
    },
    crash_chance: {
      type: Number,
      required: true,
      default: 50,
    },
    min_bot_count: {
      type: Number,
      required: true,
      default: 4,
    },
    max_bot_count: {
      type: Number,
      required: true,
      default: 10,
    }
  },
  { versionKey: false,timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
