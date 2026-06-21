import express from "express";
import { getHistoryPosts } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/history", getHistoryPosts);

export default router;