import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getSettingsService, updateSettingsService } from "../services/settings.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const data = await getSettingsService();
  return successResponse(res, "Settings fetched", data);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = await updateSettingsService(req.body);
  return successResponse(res, "Settings updated", data);
});