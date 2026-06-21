import { findPostById } from "../repositories/post.repository.js";

export const updatePostService = async (id, payload) => {
  const post = await findPostById(id);

  if (!post) {
    throw new Error("Post not found");
  }

  if (payload.title) post.title = payload.title;
  if (payload.caption) post.caption = payload.caption;
  if (payload.status) post.status = payload.status;

  await post.save();

  return post;
};