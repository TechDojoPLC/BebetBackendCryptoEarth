const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { FileSchema } = require("../../utils/file/file.schema");

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
  }
);

module.exports = mongoose.model("Admin", AdminSchema);
