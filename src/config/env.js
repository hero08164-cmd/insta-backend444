import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "PORT",
  "NODE_ENV",
  "FRONTEND_URL",
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "APP_ID",
  "APP_SECRET",
  "ACCESS_TOKEN",
  "FACEBOOK_PAGE_ID",
  "INSTAGRAM_USER_ID",
  "CRON_TIME",
  "TIMEZONE"
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing Environment Variables:");
  missing.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}

export const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,

  MONGODB_URI: process.env.MONGODB_URI,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  APP_ID: process.env.APP_ID,
  APP_SECRET: process.env.APP_SECRET,

  ACCESS_TOKEN: process.env.ACCESS_TOKEN,

  FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,

  INSTAGRAM_USER_ID: process.env.INSTAGRAM_USER_ID,

  CRON_TIME: process.env.CRON_TIME,

  TIMEZONE: process.env.TIMEZONE
};