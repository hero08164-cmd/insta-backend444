import cron from "node-cron";
import { getSmartNextPost } from "../services/smartPostSelector.service.js";
import { postNowService } from "../services/postNow.service.js";
import { getSettingsService } from "../services/settings.service.js";
import DailyLock from "../models/dailyLock.model.js";
import { emitEvent } from "../realtime/socket.helper.js";

const getTodayDateInTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // YYYY-MM-DD in that timezone
};

const getCurrentTimeInTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const isAlreadyPostedToday = async (timezone) => {
  const today = getTodayDateInTimezone(timezone);
  const lock = await DailyLock.findOne({ date: today });
  return!!lock;
};

const setDailyLock = async (timezone) => {
  const today = getTodayDateInTimezone(timezone);
  await DailyLock.findOneAndUpdate(
    { date: today },
    { date: today, status: "posted" },
    { upsert: true, new: true }
  );
};

export const runSmartCronJob = async ({ ignoreLock = false, timezone = "Asia/Kolkata" } = {}) => {
  console.log("🔥 SMART CRON TRIGGERED");

  if (!ignoreLock) {
    const alreadyPosted = await isAlreadyPostedToday(timezone);
    if (alreadyPosted) {
      console.log("⚠ Already posted today. Skipping cron.");
      return { skipped: true, reason: "already_posted_today" };
    }
  }

  const post = await getSmartNextPost();
  if (!post) {
    console.log("⚠ No pending posts found.");
    return { skipped: true, reason: "no_pending_posts" };
  }

  console.log("🚀 Selected Post:", post._id);
  const result = await postNowService(post._id);

  emitEvent("queue:update", result);
  emitEvent("dashboard:update", result);
  emitEvent("history:update", result);

  if (!ignoreLock) {
    await setDailyLock(timezone);
  }

  console.log("✅ DAILY POST COMPLETED SUCCESSFULLY");
  return { skipped: false, post: result };
};

export const startSmartCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const settings = await getSettingsService();
      const { dailyTime, timezone } = settings;
      const tz = timezone || "Asia/Kolkata";

      const currentTime = getCurrentTimeInTimezone(tz);
      const today = getTodayDateInTimezone(tz);

      console.log(`🕒 [cron-check] now=${currentTime} target=${dailyTime} tz=${tz} date=${today}`);

      // ✅ FIX: 10 minute ka window
      const currentMins = timeToMinutes(currentTime);
      const targetMins = timeToMinutes(dailyTime);

      // Agar ab ka time target se pehle hai -> skip
      if (currentMins < targetMins) return;

      // Agar target se 10 min se zyada nikal gaya -> aaj ke liye miss, kal try karega
      // Isse 09:00 target tha aur 09:05 pe server up hua to bhi post hoga
      if (currentMins >= targetMins + 10) return;

      // Window ke andar hai -> post karo
      console.log(`⏰ Time matched in window (${currentTime} >= ${dailyTime}) — running auto-post`);
      await runSmartCronJob({ timezone: tz });

    } catch (error) {
      console.error("❌ SMART CRON ERROR:", error.message);
    }
  });

  console.log("🕒 Smart Cron Engine started — checking every minute against Settings.dailyTime");
};
