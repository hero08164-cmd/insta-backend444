import express from "express";
import { deletePost } from "../controllers/delete.controller.js";

const router = express.Router();

router.delete("/:id", deletePost);

export default router;