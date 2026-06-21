import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getPendingPostsService } from "../services/queue.service.js";

export const getPendingPosts = asyncHandler(async (req, res) => {
  const posts = await getPendingPostsService();

  const safePosts = Array.isArray(posts) ? posts : [];

  // normalize id (Mongo _id -> id)
  const normalized = safePosts.map((p) => ({
    ...p,
    id: p.id || p._id,
  }));

  return successResponse(
    res,
    "Pending posts fetched successfully",
    normalized
  );
});