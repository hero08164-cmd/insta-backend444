import express from "express";
import { getPendingPosts } from "../controllers/queue.controller.js";

const router = express.Router();

router.get("/pending", getPendingPosts);

export default router;