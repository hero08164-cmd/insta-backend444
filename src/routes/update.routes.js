import express from "express";
import { updatePost } from "../controllers/update.controller.js";

const router = express.Router();

router.put("/:id", updatePost);

export default router;