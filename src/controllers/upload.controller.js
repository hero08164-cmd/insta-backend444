import asyncHandler from "../middlewares/asyncHandler.js";
import { emitEvent } from "../realtime/events.js";
import { successResponse } from "../utils/response.js";
import { uploadPostsService } from "../services/upload.service.js";

export const uploadPosts = asyncHandler(async (req, res) => {
  const posts = await uploadPostsService(
    req.files,
    req.posts
  );

  // Realtime Updates
  emitEvent("queue:update");
  emitEvent("dashboard:update");

  return successResponse(
    res,
    "Posts uploaded successfully.",
    {
      count: posts.length,
      ids: posts.map((post) => post._id),
    },
    201
  );
});