import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getDashboardService } from "../services/dashboard.service.js";

/**
 * =========================
 * DASHBOARD SUMMARY
 * =========================
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardService();

  const safeDashboard = dashboard || {
    totalUploaded: 0,
    pending: 0,
    posted: 0,
    failed: 0,
    postedToday: 0,
  };

  return successResponse(
    res,
    "Dashboard data fetched successfully",
    safeDashboard
  );
});

/**
 * =========================
 * DASHBOARD CHARTS (FIXED)
 * =========================
 */
export const getDashboardCharts = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardService();

  const data = dashboard || {
    pending: 0,
    posted: 0,
    failed: 0,
  };

  // frontend-safe chart format (VERY IMPORTANT)
  const charts = {
    statusDistribution: [
      { label: "Pending", value: data.pending },
      { label: "Posted", value: data.posted },
      { label: "Failed", value: data.failed },
    ],
  };

  return successResponse(
    res,
    "Dashboard charts fetched successfully",
    charts
  );
});