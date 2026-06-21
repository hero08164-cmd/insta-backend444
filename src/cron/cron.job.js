import { startSmartCron } from "../cron/smartCron.js";

/**
 * =========================
 * OLD CRON WRAPPER (DEPRECATED)
 * =========================
 * अब direct scheduling यहाँ नहीं होगा
 * सिर्फ smartCron को delegate करेगा
 */

export const startCronJob = () => {
  console.log("🟡 cron.job.js -> delegating to smartCron.js");

  try {
    startSmartCron();

    console.log("✅ Smart Cron Engine Activated");
  } catch (error) {
    console.error("❌ Cron start failed:", error);
    throw error;
  }
};