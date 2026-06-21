import { Router } from "express"; // 1. Router को import करें
import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import Post from "../models/post.model.js";

const router = Router(); // 2. राउटर को यहाँ डिफाइन करें

/**
 * =========================
 * DASHBOARD CONTROLLERS
 * =========================
 */
const getDashboard = asyncHandler(async (req, res) => {
  const totalUploaded = await Post.countDocuments();
  const pending = await Post.countDocuments({ status: "pending" });
  const posted = await Post.countDocuments({ status: "posted" });
  const failed = await Post.countDocuments({ status: "failed" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const postedToday = await Post.countDocuments({
    status: "posted",
    postedAt: { $gte: today },
  });

  return successResponse(res, "Dashboard data fetched successfully", {
    totalUploaded,
    pending,
    posted,
    failed,
    postedToday,
  });
});

const getDashboardCharts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}, "status createdAt postedAt");
  const map = {};

  posts.forEach((post) => {
    const date = new Date(post.createdAt).toISOString().split("T")[0];
    if (!map[date]) {
      map[date] = { date, uploaded: 0, posted: 0, failed: 0 };
    }
    map[date].uploaded += 1;
    if (post.status === "posted") map[date].posted += 1;
    if (post.status === "failed") map[date].failed += 1;
  });

  const chartData = Object.values(map).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return successResponse(res, "Dashboard charts fetched successfully", chartData);
});

/**
 * =========================
 * ROUTES
 * =========================
 * NOTE: root ("/") route add किया गया है क्योंकि frontend
 * सीधे GET /api/dashboard को call करता है (न कि /api/dashboard/summary).
 * "/summary" को backward-compatibility के लिए रखा गया है ताकि
 * अगर कहीं और code उसे call कर रहा हो तो वो भी काम करता रहे.
 */
router.get("/", getDashboard);          // 👈 FIX: GET /api/dashboard
router.get("/summary", getDashboard);   // alias, same data
router.get("/charts", getDashboardCharts);

export default router; // अब यह बिल्कुल सही काम करेगा