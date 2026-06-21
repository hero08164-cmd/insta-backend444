import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },

    status: String,

    message: String,

    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ActivityLog", ActivityLogSchema);