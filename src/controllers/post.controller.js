import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import mongoose from "mongoose"; // top pe add karo agar pehle se nahi hai

/**
 * =========================
 * CLOUDINARY BUFFER UPLOAD HELPER
 * =========================
 * multer memoryStorage सीधे file को buffer (RAM) में देता है,
 * disk पर save नहीं करता — इसलिए हमें upload_stream से सीधे
 * buffer को Cloudinary पर भेजना है.
 */
const uploadBufferToCloudinary = (buffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType, // "image" | "video"
        folder: "instagram-auto-poster",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * =========================
 * UPLOAD POSTS (FIXED)
 * =========================
 * multer (`upload.array("files")`) के बाद:
 *  - req.files  -> uploaded files का array (buffer + mimetype + size)
 *  - req.body.posts -> JSON.stringify किया हुआ metadata array
 *                       (frontend से [{ title, caption, type }, ...])
 */
export const uploadPosts = async (req, res, next) => {
  try {
    const files = req.files || [];

    if (!files.length) {
      return errorResponse(res, "No files uploaded", 400);
    }

    let metadata = [];
    try {
      metadata = JSON.parse(req.body.posts || "[]");
    } catch (e) {
      return errorResponse(res, "Invalid posts metadata", 400);
    }

    if (!Array.isArray(metadata) || metadata.length !== files.length) {
      return errorResponse(
        res,
        "Files count and posts metadata count do not match",
        400
      );
    }

    // हर file को Cloudinary पर upload करो और Post document बनाओ
    const docsToCreate = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = metadata[i] || {};

      const resourceType = file.mimetype.startsWith("video")
        ? "video"
        : "image";

      const result = await uploadBufferToCloudinary(file.buffer, resourceType);

      docsToCreate.push({
        title: meta.title,
        caption: meta.caption,
        type: meta.type, // "image" | "reel"
        thumbnail: result.secure_url,
        cloudinary: {
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
        },
        sizeMb: file.size ? +(file.size / (1024 * 1024)).toFixed(2) : 0,
        mimeType: file.mimetype,
        width: result.width || null,
        height: result.height || null,
      });
    }

    const created = await Post.insertMany(docsToCreate);

    return successResponse(res, "Posts uploaded successfully", {
      count: created.length,
      posts: created,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * PENDING POSTS
 * =========================
 */
export const getPendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .sort({ position: 1 })
      .lean();

    return successResponse(
      res,
      "Pending posts fetched",
      posts
    );
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * HISTORY POSTS
 * =========================
 */
export const getHistoryPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "posted" })
      .sort({ postedAt: -1 })
      .lean();

    return successResponse(
      res,
      "History fetched successfully",
      posts
    );
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * DELETE POST
 * =========================
 */
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Valid post id is required", 400);
    }

    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, "Post not found", 404);
    }

    return successResponse(res, "Post deleted", deleted);
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * UPDATE POST
 * =========================
 */
export const updatePost = async (req, res, next) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return successResponse(
      res,
      "Post updated",
      updated
    );
  } catch (err) {
    next(err);
  }
};