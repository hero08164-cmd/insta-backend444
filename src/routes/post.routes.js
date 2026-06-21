import express from "express";
import {
  uploadPosts,
  getPendingPosts,
  getHistoryPosts,
  deletePost,
  updatePost,
} from "../controllers/post.controller.js";

import { postNow } from "../controllers/postNow.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * ======================
 * POST ROUTES
 * ======================
 */

// CREATE
// FIX: multer middleware add किया — "files" field name से multiple
// files accept करेगा, jisse req.files aur req.body दोनों सही populate होंगे.
router.post("/upload", upload.array("files"), uploadPosts);

// READ
router.get("/pending", getPendingPosts);
router.get("/history", getHistoryPosts);

// UPDATE
router.put("/:id", updatePost);

// DELETE
router.delete("/:id", deletePost);

// MANUAL POST (instant publish)
router.post("/post-now", postNow);

export default router;