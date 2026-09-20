import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import DailyLock from "../models/dailyLock.model.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);

// ✅ TEMP FIX: Aaj ka DailyLock clear karne ke liye
// Isse purana 2026-09-20 wala lock delete hoga jo fail ke baad bhi lag gaya tha
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

// Single date clear karna ho to
router.delete("/clear-lock/:date", async (req, res) => {
  try {
    const { date } = req.params; // 2026-09-20
    const result = await DailyLock.deleteOne({ date });
    res.json({ success: true, message: `Lock for ${date} cleared`, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
