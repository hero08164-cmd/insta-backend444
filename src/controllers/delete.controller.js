import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { deletePostService } from "../services/delete.service.js";
import { emitEvent } from "../realtime/events.js";

export const deletePost = asyncHandler(async (req, res) => {
  const result = await deletePostService(req.params.id);

  return successResponse(
    res,
    "Post deleted successfully.",
    result
  );
});

emitEvent("queue:update");
emitEvent("dashboard:update");