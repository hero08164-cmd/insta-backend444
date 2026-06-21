import Post from "../models/post.model.js";

export const getNextPost = async () => {
  return await Post.findOne({ status: "pending" })
    .sort({
      priority: -1,
      retryCount: 1,
      createdAt: 1
    });
};

export const markAsPosted = async (post, mediaId) => {
  post.status = "posted";
  post.postedAt = new Date();
  post.instagramMediaId = mediaId;
  await post.save();
};

export const markAsFailed = async (post, error) => {
  post.retryCount += 1;
  post.lastError = error;

  if (post.retryCount >= 3) {
    post.status = "failed";
  }

  await post.save();
};