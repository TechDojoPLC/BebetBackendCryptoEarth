const { Schema, model, Types } = require("mongoose");
const { FileSchema } = require("../../utils/file/file.schema");

const ImageSchema = new Schema(
  {
    content: {
      type: FileSchema,
      required: true,
    },
    wallet:{
      type: Types.ObjectId,
      ref: "WalletData",
      required: true
    }
  }  ,  { versionKey: false,timestamps: true }
);

module.exports = model("Image", ImageSchema);
