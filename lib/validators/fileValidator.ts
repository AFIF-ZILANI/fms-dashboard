import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function validateImageBuffer(buffer: Buffer) {
    // Detect real file type (not trusting browser MIME)
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
        throw new Error("Invalid image format");
    }

    // Validate dimensions
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
        throw new Error("Corrupted image file");
    }

    // Optional security limits
    if (metadata.width > 2000 || metadata.height > 2000) {
        throw new Error("Image dimensions too large");
    }

    if (metadata.width < 200 || metadata.height < 200) {
        throw new Error("Image dimensions too small");
    }

    return true;
}