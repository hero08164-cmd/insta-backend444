import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import errorMiddleware from "./middlewares/error.middleware.js";

// SINGLE MASTER ROUTE ONLY
import postRoutes from "./routes/post.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
// dashboardRoutes के बजाय कोई भी नाम रख सकते हैं (जैसे dashboardRoutes या router)
import dashboardRoutes from "./routes/dashboard.routes.js";

import testRoutes from "./routes/test.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * =========================
 * SECURITY + CORE MIDDLEWARE
 * =========================
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://td1212989-ux-instagram-auto-post-frontend.instagramautopost.workers.dev",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  process.env.FRONTEND_URL,
  "https://td1212989-ux-instagram-auto-post-frontend.instagramautopost.workers.dev",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(morgan("dev"));

/**
 * =========================
 * BODY PARSER
 * =========================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =========================
 * STATIC FILES
 * =========================
 */
app.use(express.static(path.join(__dirname, "../public")));

/**
 * =========================
 * HEALTH ROUTES
 * =========================
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Instagram Auto Poster Backend Running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
  });
});

/**
 * =========================
 * API ROUTES (CLEAN SYSTEM)
 * =========================
 */
app.use("/api/posts", postRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/test", testRoutes);

/**
 * =========================
 * ERROR HANDLER
 * =========================
 */
app.use(errorMiddleware);

export default app;