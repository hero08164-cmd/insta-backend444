import { Post } from "../models/index.js";

export const createPost = async ({
  title,
  caption,
  type,
  file,
  cloudinaryResult,
  position
}) => {
  return Post.create({
    title,

    caption,

    type,

    status: "pending",

    thumbnail: cloudinaryResult.secure_url,

    cloudinary: {
      publicId: cloudinaryResult.public_id,
      secureUrl: cloudinaryResult.secure_url,
      resourceType: cloudinaryResult.resource_type
    },

    sizeMb: Number(
      (file.size / 1024 / 1024).toFixed(2)
    ),

    mimeType: file.mimetype,

    width: cloudinaryResult.width,

    height: cloudinaryResult.height,

    duration: cloudinaryResult.duration || null,

    position
  });
};

export const getPendingPosts = () => {
  return Post.find({ status: "pending" }).sort({
    position: 1,
    createdAt: 1
  });
};

export const getLastQueuePosition = async () => {
  const lastPost = await Post.findOne()
    .sort({ position: -1 })
    .select("position");

  return lastPost ? lastPost.position : 0;
};

export const getHistoryPosts = async () => {
  return await Post.find({
    status: {
      $in: ["posted", "failed"]
    }
  })
    .sort({
      postedAt: -1,
      updatedAt: -1
    })
    .lean();
};

export const findPostById = async (id) => {
  return await Post.findById(id);
};

export const deletePostById = async (id) => {
  return await Post.findByIdAndDelete(id);
};

export const reorderPendingQueue = async () => {
  const posts = await Post.find({ status: "pending" })
    .sort({ position: 1 });

  for (let i = 0; i < posts.length; i++) {
    posts[i].position = i + 1;
    await posts[i].save();
  }
};