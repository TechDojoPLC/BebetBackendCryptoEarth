const { Schema, model, Types } = require("mongoose");
const { FileSchema } = require("../../utils/file/file.schema");

const ChatSchema = new Schema(
  {
    
  }  ,  { versionKey: false,timestamps: true }
);

module.exports = model("Chat", ChatSchema);
