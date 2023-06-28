const { Schema, model, Types } = require("mongoose");
const { FileSchema } = require("../../utils/file/file.schema");
const { type } = require("./chat_message.constants");

const ChatMessageSchema = new Schema(
  {
    user:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat:{
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: "undefined"
    },
    text: {
      type: String,
      required: true,
    },
  }  ,  { versionKey: false,timestamps: true }
);

module.exports = model("ChatMessage", ChatMessageSchema);
