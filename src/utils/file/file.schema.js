const { Schema } = require("mongoose");

const FileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

module.exports = { FileSchema };
