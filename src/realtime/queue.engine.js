import cron from "node-cron";
import Post from "../models/post.model.js";
import { emitPostPublished } from "./events.js";

// 🔥 MAIN ENGINE
export const startQueueEngine = () => {
  console.log("🚀 Queue Engine Started");

  cron.schedule("* * * * *", async () => {
    try {
      const post = await Post.findOne({ status: "pending" }).sort({
        position: 1,
      });

      if (!post) return;

      console.log("📤 Publishing post:", post._id);

      // TODO: Instagram API call here
      post.status = "posted";
      post.postedAt = new Date();
      await post.save();

      emitPostPublished(post);
    } catch (err) {
      console.error("Queue Engine Error:", err.message);
    }
  });
};