import app from "./app.js";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { initSocket } from "./realtime/socket.js";

import "./config/cloudinary.js";
import { startCronJob } from "./jobs/cron.job.js";

async function startServer() {
  try {
    console.log("⏳ Starting Instagram Auto Poster Backend...");

    // =========================
    // DATABASE
    // =========================
    await connectDatabase();
    console.log("✅ Database Connected");

    // =========================
    // CRON JOB
    // =========================
    startCronJob();
    console.log("✅ Cron Job Started");

    // =========================
    // SERVER START
    // =========================
    const server = app.listen(env.PORT, () => {
      console.log("");
      console.log("=================================");
      console.log("🚀 Instagram Auto Poster Backend");
      console.log("=================================");
      console.log(`Environment : ${env.NODE_ENV}`);
      console.log(`Server      : http://localhost:${env.PORT}`);
      console.log(`Health      : http://localhost:${env.PORT}/api/health`);
      console.log("=================================");
    });

    // =========================
    // SOCKET
    // =========================
    const io = initSocket(server);

    if (!io) {
      throw new Error("Socket initialization failed");
    }

    console.log("✅ Socket Server Started Successfully");

    global.io = io;

  } catch (error) {
    console.error("❌ Server Startup Failed:", error);
    process.exit(1);
  }
}

startServer();