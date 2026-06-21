import asyncHandler from "../middlewares/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { postNowService } from "../services/postNow.service.js";
import { emitEvent } from "../realtime/socket.helper.js";

export const postNow = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, "Post ID is required", 400);
    }

    const result = await postNowService(id);

    // realtime updates (safe) — ab result me hamesha data.postId consistent hai
    emitEvent("queue:update", result);
    emitEvent("dashboard:update", result);
    emitEvent("history:update", result);

    // FIX: agar service ne fail bola, to controller bhi sach bole — jhooth na bole
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Post publishing failed",
        data: result.data || null,
        error: result.error || null,
        retryCount: result.retryCount,
      });
    }

    return successResponse(
      res,
      result.message || "Post published successfully",
      result
    );

  } catch (error) {
    return errorResponse(
      res,
      error.message || "Post publishing failed",
      500
    );
  }
});