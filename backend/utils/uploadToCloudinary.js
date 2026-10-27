import cloudinary from "./cloudinary.js";

const uploadToCloudinary = (buffer, resourceType = "image", folder = "social-media/posts") => {
    // If Cloudinary credentials are missing, immediately fallback to Data URI
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        const b64 = Buffer.from(buffer).toString("base64");
        const mime = resourceType === "video" ? "video/mp4" : "image/jpeg";
        return Promise.resolve({ secure_url: `data:${mime};base64,${b64}` });
    }

    return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.warn("Cloudinary upload failed, falling back to base64 Data URI:", error.message);
                    const b64 = Buffer.from(buffer).toString("base64");
                    const mime = resourceType === "video" ? "video/mp4" : "image/jpeg";
                    resolve({ secure_url: `data:${mime};base64,${b64}` });
                    return;
                }
                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

export default uploadToCloudinary;
