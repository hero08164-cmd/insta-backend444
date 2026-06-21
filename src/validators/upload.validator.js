import { z } from "zod";

export const uploadValidator = (req, res, next) => {
  try {
    let posts;

    /**
     * =========================
     * MODE 1: FILE + JSON (multer)
     * =========================
     */
    if (req.files && req.files.length > 0) {
      if (!req.body.posts) {
        throw new Error("Posts data is missing.");
      }

      try {
        posts = JSON.parse(req.body.posts);
      } catch {
        throw new Error("Posts must be valid JSON.");
      }

      if (!Array.isArray(posts)) {
        throw new Error("Posts must be an array.");
      }

      if (posts.length !== req.files.length) {
        throw new Error("Files count and posts count must match.");
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(120),
        caption: z.string().trim().min(1).max(2200),
        type: z.enum(["image", "reel"]),
      });

      posts.forEach((post, index) => {
        schema.parse(post);

        const file = req.files[index];

        if (post.type === "image" && !file.mimetype.startsWith("image/")) {
          throw new Error(`${file.originalname} is not an image.`);
        }

        if (post.type === "reel" && !file.mimetype.startsWith("video/")) {
          throw new Error(`${file.originalname} is not a video.`);
        }
      });

      req.posts = posts;
      req.uploadMode = "file";

      return next();
    }

    /**
     * =========================
     * MODE 2: JSON ONLY (NO FILE)
     * =========================
     */
    if (req.body.posts) {
      try {
        posts = typeof req.body.posts === "string"
          ? JSON.parse(req.body.posts)
          : req.body.posts;
      } catch {
        throw new Error("Posts must be valid JSON.");
      }

      if (!Array.isArray(posts)) {
        throw new Error("Posts must be an array.");
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(120),
        caption: z.string().trim().min(1).max(2200),
        type: z.enum(["image", "reel"]),

        // optional thumbnail mode
        thumbnail: z.string().url().optional(),
      });

      posts.forEach((post) => {
        schema.parse(post);
      });

      req.posts = posts;
      req.uploadMode = "json";

      return next();
    }

    throw new Error("No posts or files provided.");
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};