import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  caption: String,
  type: String,
  status: String,
  thumbnail: String,
  position: Number,
  sizeMb: Number,
}, { timestamps: true });

export default mongoose.model("Post", postSchema);