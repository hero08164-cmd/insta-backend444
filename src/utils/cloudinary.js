import { v2 as cloudinary } from "cloudinary";

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
};