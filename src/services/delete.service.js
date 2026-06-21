import {
  findPostById,
  deletePostById,
  reorderPendingQueue
} from "../repositories/post.repository.js";

import { deleteFromCloudinary } from "../utils/cloudinary.js";

export const deletePostService = async (id) => {
  const post = await findPostById(id);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.cloudinary?.publicId) {
    await deleteFromCloudinary(
      post.cloudinary.publicId,
      post.cloudinary.resourceType
    );
  }

  await deletePostById(id);

  await reorderPendingQueue();

  return {
    id,
    deleted: true
  };
};