import Post from "../models/post.model.js";

/**
 * SMART SELECTION ENGINE
 * Reel priority > Image fallback
 */
export const getSmartNextPost = async () => {
  // 1. FIRST TRY REELS
  let post = await Post.findOne({
    status: "pending",
    type: "reel",
  }).sort({ position: 1 });

  // 2. IF NO REEL → fallback image
  if (!post) {
    post = await Post.findOne({
      status: "pending",
      type: "image",
    }).sort({ position: 1 });
  }

  return post;
};