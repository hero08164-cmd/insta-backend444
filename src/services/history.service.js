import { getHistoryPosts } from "../repositories/post.repository.js";

export const getHistoryPostsService = async () => {
  return await getHistoryPosts();
};