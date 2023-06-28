const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { FileSchema } = require("../../utils/file/file.schema");

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: false,
    },
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
    sex: {
      type: String,
      required: false,
    },
    tel: {
      type: String,
      required: false,
    },
    avatar: {
      type: FileSchema,
      required: false,
    }
  }
);

module.exports = mongoose.model("Admin", AdminSchema);
