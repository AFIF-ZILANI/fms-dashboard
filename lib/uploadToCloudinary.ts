import cloudinary from "@/lib/cloudinary";
import { validateImageBuffer } from "@/lib/validators/fileValidator";

export async function uploadImageToCloudinary(file: File | null, { folder }: { folder: string }): Promise<{
    public_id: string;
    image_url: string;
} | null> {
    if (!file || file.size === 0) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Strict validation
    await validateImageBuffer(buffer);

    return await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: "image",
                    transformation: [
                        { width: 1024, height: 1024, crop: "limit" },
                        { quality: "auto" },
                        { fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);

                    resolve({
                        public_id: result?.public_id!,
                        image_url: result?.secure_url!,
                    });
                }
            )
            .end(buffer);
    });
}