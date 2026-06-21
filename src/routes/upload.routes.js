import express from "express";

import upload from "../middlewares/upload.middleware.js";
import { uploadValidator } from "../validators/upload.validator.js";
import { uploadPosts } from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/upload",
  upload.array("files", 100),
  uploadValidator,
  uploadPosts
);

export default router;