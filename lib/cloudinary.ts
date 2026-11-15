import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder = "ilavioo",
  resourceType: "auto" | "image" | "video" = "auto"
) {
  return new Promise<{
    url: string;
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
    width?: number;
    height?: number;
    duration?: number;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result returned from Cloudinary"));
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

