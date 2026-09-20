import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import DailyLock from "../models/dailyLock.model.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);

// ✅ FIX: GET + DELETE dono support - browser se khulega
router.get("/clear-lock", async (req, res) => {
  try {
    const result = await DailyLock.deleteMany({});
    console.log(`🗑️ DailyLock cleared: ${result.deletedCount} docs deleted`);
    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} lock(s) - ab cron fir se chalega`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/clear-lock", async (req, res) => {
  try {
    const result = await DailyLock.deleteMany({});
    console.log(`🗑️ DailyLock cleared: ${result.deletedCount} docs deleted`);
    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} lock(s) - ab cron fir se chalega`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/clear-lock/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const result = await DailyLock.deleteOne({ date });
    res.json({ success: true, message: `Lock for ${date} cleared`, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
