import { getNextPostForPublishing } from "./queueEngine.service.js";
import { markPostFailed } from "./retry.service.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import axios from "axios";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Instagram media container ready hone tak wait karo
const waitForMediaReady = async (containerId) => {
  let attempts = 0;
  const maxAttempts = 20; // 20 * 3sec = 60 sec max

  while (attempts < maxAttempts) {
    await sleep(3000);
    
    const statusRes = await axios.get(
      `https://graph.facebook.com/v20.0/${containerId}`,
      {
        params: {
          fields: "status_code,status",
          access_token: process.env.IG_ACCESS_TOKEN,
        }
      }
    );

    const status = statusRes.data.status_code;
    console.log(`⏳ IG Processing: attempt ${attempts + 1}/${maxAttempts} - ${status}`);

    if (status === "FINISHED") return true;
    if (status === "ERROR") throw new Error(`IG Media processing failed: ${JSON.stringify(statusRes.data)}`);
    
    attempts++;
  }

  throw new Error("Media not ready after 60 seconds - IG timeout");
};

export const postNowService = async (id = null) => {
  let post;

  if (id) {
    post = await Post.findById(id);
  } else {
    post = await getNextPostForPublishing();
  }

  if (!post) {
    return { success: false, message: "No posts found to publish", data: null };
  }

  try {
    let createPayload = {
      caption: post.caption,
      access_token: process.env.IG_ACCESS_TOKEN,
    };

    // ✅ FIX: Reel ke liye video_url sahi field se lo
    if (post.type === "reel") {
      createPayload.media_type = "REELS";
      // thumbnail nahi, video URL chahiye
      // agar tere DB me videoUrl alag field hai to wo use kar
      createPayload.video_url = post.videoUrl || post.mediaUrl || post.thumbnail;
      
      console.log("🎬 Creating REEL container:", createPayload.video_url);
    } else {
      createPayload.image_url = post.thumbnail || post.mediaUrl;
      console.log("🖼️ Creating IMAGE container");
    }

    const create = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.IG_USER_ID}/media`,
      createPayload
    );

    const creationId = create.data.id;
    console.log("📦 Container created:", creationId);

    // ✅ FIX: Reel hai to processing ka wait karo
    if (post.type === "reel") {
      await waitForMediaReady(creationId);
    }

    const publish = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.IG_USER_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: process.env.IG_ACCESS_TOKEN,
      }
    );

    console.log("✅ IG Published:", publish.data.id);

    post.status = "posted";
    post.postedAt = new Date();
    post.instagramMediaId = publish.data.id;
    await post.save();

    if (post.cloudinary?.publicId) {
      await deleteFromCloudinary(post.cloudinary.publicId, post.cloudinary.resourceType);
    }

    return {
      success: true,
      message: "Post published successfully",
      data: { postId: post._id, instagramMediaId: publish.data.id },
    };
  } catch (error) {
    console.log("🔥 INSTAGRAM ERROR FULL:", error.response?.data || error.message);

    await markPostFailed(post, error.message);

    return {
      success: false,
      message: "Post failed",
      error: error.response?.data?.error?.message || error.message,
      retryCount: post.retryCount || 0,
      data: { postId: post._id },
    };
  }
};
