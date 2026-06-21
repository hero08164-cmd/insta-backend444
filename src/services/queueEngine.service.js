import Post from "../models/post.model.js";

/**
 * SMART QUEUE ENGINE
 * selects best post for publishing
 */
export const getNextPostForPublishing = async () => {
  const post = await Post.findOne({
    status: "pending"
  })
    .sort({
      priority: -1,
      retryCount: 1,
      position: 1,
      createdAt: 1
    });

  return post;
};