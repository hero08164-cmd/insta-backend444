import cron from "node-cron";
import { getSmartNextPost } from "../services/smartPostSelector.service.js";
import { postNowService } from "../services/postNow.service.js";
import { getSettingsService } from "../services/settings.service.js";
import DailyLock from "../models/dailyLock.model.js";
import { emitEvent } from "../realtime/socket.helper.js";

/**
 * =========================
 * DAILY LOCK CHECK
 * =========================
 */
const isAlreadyPostedToday = async () => {
  const today = new Date().toISOString().split("T")[0];
  const lock = await DailyLock.findOne({ date: today });
  return !!lock;
};

/**
 * =========================
 * SET DAILY LOCK
 * =========================
 */
const setDailyLock = async () => {
  const today = new Date().toISOString().split("T")[0];

  await DailyLock.findOneAndUpdate(
    { date: today },
    { date: today, status: "posted" },
    { upsert: true, new: true }
  );
};

/**
 * =========================
 * GET CURRENT TIME IN A GIVEN TIMEZONE
 * =========================
 * Settings.timezone के हिसाब से अभी का समय "HH:mm" format
 * में निकालता है (जैसे "07:00"), बिना किसी extra library के —
 * Node का built-in Intl API काफी है.
 */
const getCurrentTimeInTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(new Date()); // e.g. "07:00"
};

/**
 * =========================
 * CORE JOB LOGIC (REUSABLE — MANUAL TEST के लिए भी)
 * =========================
 * @param {boolean} ignoreLock - true पास करने पर DailyLock
 *   check skip हो जाएगा (sirf manual testing ke liye use करें).
 */
export const runSmartCronJob = async ({ ignoreLock = false } = {}) => {
  console.log("🔥 SMART CRON TRIGGERED");

  // 1. DAILY LOCK CHECK
  if (!ignoreLock) {
    const alreadyPosted = await isAlreadyPostedToday();

    if (alreadyPosted) {
      console.log("⚠️ Already posted today. Skipping cron.");
      return { skipped: true, reason: "already_posted_today" };
    }
  }

  // 2. GET SMART POST (reel > image fallback logic inside service)
  const post = await getSmartNextPost();

  if (!post) {
    console.log("⚠️ No pending posts found.");
    return { skipped: true, reason: "no_pending_posts" };
  }

  console.log("🚀 Selected Post:", post._id);

  // 3. POST TO INSTAGRAM
  const result = await postNowService(post._id);

  // 4. SOCKET EVENTS
  emitEvent("queue:update", result);
  emitEvent("dashboard:update", result);
  emitEvent("history:update", result);

  // 5. DAILY LOCK SET
  if (!ignoreLock) {
    await setDailyLock();
  }

  console.log("✅ DAILY POST COMPLETED SUCCESSFULLY");

  return { skipped: false, post: result };
};

/**
 * =========================
 * SMART CRON ENGINE (DYNAMIC — FRONTEND CONTROLLED)
 * =========================
 * अब ये hardcoded time पर नहीं चलता. ये हर मिनट चलता है,
 * और हर बार DB (Settings.dailyTime + Settings.timezone) से
 * असली scheduled time पढ़ता है. अगर अभी का समय उससे match
 * करे, तभी post होता है — वरना चुपचाप skip.
 *
 * इसका मतलब: Frontend Settings page से time बदलकर "Save"
 * दबाते ही, बिना backend restart किए, अगले matching मिनट से
 * नया time अपने-आप असर करने लगेगा.
 */
export const startSmartCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const settings = await getSettingsService();
      const { dailyTime, timezone } = settings;

      const currentTime = getCurrentTimeInTimezone(timezone || "Asia/Kolkata");

      // DEBUG: हर मिनट दिखाएगा कि cron ज़िंदा है और किससे compare कर रहा है
      console.log(
        `🕒 [cron-check] now=${currentTime} target=${dailyTime} tz=${timezone}`
      );

      // अभी का minute scheduled time से match नहीं करता -> chup-chap skip
      if (currentTime !== dailyTime) {
        return;
      }

      console.log(
        `⏰ Scheduled time matched (${currentTime} ${timezone}) — running auto-post`
      );

      await runSmartCronJob();
    } catch (error) {
      console.error("❌ SMART CRON ERROR:", error.message);
    }
  });

  console.log(
    "🕒 Smart Cron Engine started — checking every minute against Settings.dailyTime"
  );
};