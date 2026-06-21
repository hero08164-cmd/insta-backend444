import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { updatePostService } from "../services/update.service.js";
import { emitEvent } from "../realtime/socket.helper.js";

export const updatePost = asyncHandler(async (req, res) => {
  const updated = await updatePostService(req.params.id, req.body);

  emitEvent("queue:update", updated);

  return successResponse(res, "Post updated successfully.", updated);
});