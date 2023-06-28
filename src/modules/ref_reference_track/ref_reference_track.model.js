const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { status } = require("./ref_reference_track.constants")

const RefReferenceTrackSchema = new Schema(
  {
    ref_user: {
      type: Schema.Types.ObjectId,
      ref: "RefUser",
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ref_ref:{
      type: Schema.Types.ObjectId,
      ref: "RefRefs",
      required: false,
    },
    ip_adress: {
      type: String,
      required: false,
      default: ""
    },
    is_removed: {
      type: Boolean,
      default: false
    }
  }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("RefReferenceTrack", RefReferenceTrackSchema);
