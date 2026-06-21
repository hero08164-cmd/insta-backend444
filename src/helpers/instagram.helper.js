import axios from "axios";

const BASE_URL = "https://graph.facebook.com/v20.0";

export const createMediaContainer = async (post) => {
  const res = await axios.post(
    `${BASE_URL}/${process.env.IG_USER_ID}/media`,
    {
      image_url: post.thumbnail,
      caption: post.caption,
      access_token: process.env.IG_ACCESS_TOKEN
    }
  );

  return res.data;
};

export const publishMedia = async (creationId) => {
  const res = await axios.post(
    `${BASE_URL}/${process.env.IG_USER_ID}/media_publish`,
    {
      creation_id: creationId,
      access_token: process.env.IG_ACCESS_TOKEN
    }
  );

  return res.data;
};