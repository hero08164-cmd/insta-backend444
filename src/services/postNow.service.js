import { getNextPostForPublishing } from "./queueEngine.service.js";
import { markPostFailed } from "./retry.service.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import axios from "axios";

export const postNowService = async (id = null) => {
  let post;

  if (id) {
    post = await Post.findById(id);
  } else {
    post = await getNextPostForPublishing();
  }

  if (!post) {
    return {
      success: false,
      message: "No posts found to publish",
      data: null,
    };
  }

  try {
    let createPayload = {
      caption: post.caption,
      access_token: process.env.IG_ACCESS_TOKEN,
    };

    if (post.type === "reel") {
      createPayload.media_type = "REELS";
      createPayload.video_url = post.thumbnail;
    } else {
      createPayload.image_url = post.thumbnail;
    }

    const create = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.IG_USER_ID}/media`,
      createPayload
    );

    const publish = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.IG_USER_ID}/media_publish`,
      {
        creation_id: create.data.id,
        access_token: process.env.IG_ACCESS_TOKEN,
      }
    );

    post.status = "posted";
    post.postedAt = new Date();
    post.instagramMediaId = publish.data.id;

    await post.save();

    if (post.cloudinary?.publicId) {
      await deleteFromCloudinary(
        post.cloudinary.publicId,
        post.cloudinary.resourceType
      );
    }

    return {
      success: true,
      message: "Post published successfully",
      data: {
        postId: post._id,
        instagramMediaId: publish.data.id,
      },
    };
  } catch (error) {
    console.log(
      "🔥 INSTAGRAM ERROR FULL:",
      error.response?.data || error.message
    );

    await markPostFailed(post, error.message);

    // FIX: ab failure case me bhi `data.postId` hamesha milega,
    // taaki frontend kabhi `undefined` id se delete call na kare
    return {
      success: false,
      message: "Post failed",
      error: error.response?.data?.error?.message || error.message,
      retryCount: post.retryCount || 0,
      data: {
        postId: post._id,
      },
    };
  }
};