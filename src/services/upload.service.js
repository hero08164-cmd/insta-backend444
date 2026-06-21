import {
  createPost,
  getLastQueuePosition
} from "../repositories/post.repository.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary
} from "./cloudinary.service.js";

export const uploadPostsService = async (files, posts) => {
  const createdPosts = [];
  const uploadedAssets = [];

  let position = await getLastQueuePosition();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const post = posts[i];

      position++;

      const cloudinaryResult = await uploadToCloudinary(file);

      uploadedAssets.push({
        publicId: cloudinaryResult.public_id,
        resourceType: cloudinaryResult.resource_type
      });

      const savedPost = await createPost({
        title: post.title,
        caption: post.caption,
        type: post.type,
        file,
        cloudinaryResult,
        position
      });

      createdPosts.push(savedPost);
    }

    return createdPosts;
  } catch (error) {
    for (const asset of uploadedAssets) {
      try {
        await deleteFromCloudinary(
          asset.publicId,
          asset.resourceType
        );
      } catch {}
    }

    throw error;
  }
};