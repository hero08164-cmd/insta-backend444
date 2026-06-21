import Post from "../models/Post.js"; 
// IMPORTANT: ensure correct path of your Post model

export const getPendingPostsService = async () => {
  const posts = await Post.find({ status: "pending" })
    .sort({ position: 1 })
    .lean();

  return (posts || []).map((p) => ({
    id: p._id.toString(),
    title: p.title,
    caption: p.caption,
    type: p.type,
    status: p.status,
    thumbnail: p.thumbnail,
    createdAt: p.createdAt,
    scheduledFor: p.scheduledFor,
    postedAt: p.postedAt,
    position: p.position,
    sizeMb: p.sizeMb,
  }));
};