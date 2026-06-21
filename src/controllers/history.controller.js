import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getHistoryPostsService } from "../services/history.service.js";

export const getHistoryPosts = asyncHandler(async (req, res) => {
  const posts = await getHistoryPostsService();

  return successResponse(
    res,
    "History fetched successfully.",
    posts
  );
});