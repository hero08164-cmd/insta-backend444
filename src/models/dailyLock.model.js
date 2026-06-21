import mongoose from "mongoose";

const dailyLockSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // 2026-06-19 format
    },

    status: {
      type: String,
      enum: ["done", "running"],
      default: "done",
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    executedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DailyLock", dailyLockSchema);