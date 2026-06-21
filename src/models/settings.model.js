import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    dailyTime: {
      type: String,
      default: "09:00"
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
  { timestamps: true }
);

// Sahi tareeka: Pehle check karo, phir model banao
const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;