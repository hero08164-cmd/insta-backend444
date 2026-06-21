import mongoose from "mongoose";

const CronLogSchema = new mongoose.Schema(
  {
    startedAt: Date,

    finishedAt: Date,

    status: {
      type: String,
      enum: ["success", "failed"]
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },

    message: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("CronLog", CronLogSchema);