import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    caption: {
      type: String,
      required: true,
      maxlength: 2200
    },
    type: {
      type: String,
      enum: ["image", "reel"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "posted", "failed", "processing"],
      default: "pending"
    },
    thumbnail: {
      type: String,
      required: true
    },
    cloudinary: {
      publicId: String,
      secureUrl: String,
      resourceType: String
    },
    instagramMediaId: {
      type: String,
      default: null
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    postedAt: {
      type: Date,
      default: null
    },
    position: {
      type: Number,
      default: 0
    },
    sizeMb: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: null
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    },
    retryCount: {
      type: Number,
      default: 0
    },
    lastError: {
      type: String,
      default: null
    },
    priority: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES
 */
postSchema.index({ status: 1, priority: -1, retryCount: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ scheduledFor: 1 });

// SAHI TARIQA: Check agar model pehle se exist karta hai
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;