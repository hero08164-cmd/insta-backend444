import cron from "node-cron";
import { getSmartNextPost } from "../services/smartPostSelector.service.js";
import { postNowService } from "../services/postNow.service.js";
import { getSettingsService } from "../services/settings.service.js";
import DailyLock from "../models/dailyLock.model.js";
import { emitEvent } from "../realtime/socket.helper.js";

const getTodayDateInTimezone = (timezone) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
};

const getCurrentTimeInTimezone = (timezone) => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isAlreadyPostedToday = async (timezone) => {
  const today = getTodayDateInTimezone(timezone);
  return !!(await DailyLock.findOne({ date: today }));
};

const setDailyLock = async (timezone) => {
  const today = getTodayDateInTimezone(timezone);
  await DailyLock.findOneAndUpdate(
    { date: today },
    { date: today, status: "posted" },
    { upsert: true, new: true, returnDocument: 'after' }
  );
};

export const runSmartCronJob = async ({ ignoreLock = false, timezone = "Asia/Kolkata" } = {}) => {
  console.log("🔥 SMART CRON TRIGGERED");

  if (!ignoreLock) {
    if (await isAlreadyPostedToday(timezone)) {
      console.log("⚠ Already posted today. Skipping.");
      return { skipped: true, reason: "already_posted_today" };
    }
  }

  const post = await getSmartNextPost();
  if (!post) {
    console.log("⚠ No pending posts.");
    return { skipped: true, reason: "no_pending_posts" };
  }

  console.log("🚀 Selected Post:", post._id, "type:", post.type);

  // ✅ FIX: result check karo
  const result = await postNowService(post._id);

  if (!result.success) {
    console.log("❌ Post failed, NOT setting DailyLock - will retry next window");
    throw new Error(result.error || result.message);
  }

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
      const tz = settings.timezone || "Asia/Kolkata";
      const dailyTime = settings.dailyTime;

      const currentTime = getCurrentTimeInTimezone(tz);
      const today = getTodayDateInTimezone(tz);

      console.log(`🕒 [cron-check] now=${currentTime} target=${dailyTime} tz=${tz} date=${today}`);

      const curMins = timeToMinutes(currentTime);
      const targetMins = timeToMinutes(dailyTime);

      if (curMins < targetMins) return;
      if (curMins >= targetMins + 10) return; // 10 min window

      console.log(`⏰ Matched (${currentTime} >= ${dailyTime}) — posting`);
      await runSmartCronJob({ timezone: tz });

    } catch (error) {
      console.error("❌ SMART CRON ERROR:", error.message);
      // fail hone pe lock nahi lagega, agle minute retry hoga
    }
  });

  console.log("🕒 Smart Cron Engine started — checking every minute against Settings.dailyTime");
};
