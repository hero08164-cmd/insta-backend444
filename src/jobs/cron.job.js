import { startSmartCron } from "../cron/smartCron.js";

/**
 * =========================
 * CRON ENTRY POINT
 * =========================
 * server.js यहीं से startCronJob() call करता है —
 * अब ये असली, Settings-aware smartCron.js को activate करता है.
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