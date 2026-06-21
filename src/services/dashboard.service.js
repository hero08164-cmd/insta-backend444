import Post from "../models/post.model.js";

export const getDashboardService = async () => {
  const totalUploaded = await Post.countDocuments();

  const pending = await Post.countDocuments({ status: "pending" });
  const posted = await Post.countDocuments({ status: "posted" });
  const failed = await Post.countDocuments({ status: "failed" });

  const postedToday = await Post.countDocuments({
    status: "posted",
    postedAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });

  return {
    totalUploaded,
    pending,
    posted,
    failed,
    postedToday
  };
};