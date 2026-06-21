import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    dailyTime: {
      type: String,
      default: "07:00"
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },

    queueMethod: {
      type: String,
      enum: ["FIFO", "Default"],
      default: "FIFO"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Settings", SettingsSchema);