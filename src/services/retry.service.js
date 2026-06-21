import Post from "../models/post.model.js";

export const markPostFailed = async (post, errorMessage) => {
  post.retryCount += 1;
  post.lastError = errorMessage;

  // ❌ Max retry reached → mark failed permanently
  if (post.retryCount >= 3) {
    post.status = "failed";
  }

  await post.save();

  return post;
};