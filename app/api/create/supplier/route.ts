import { Avatars, UserRole } from "@/app/generated/prisma/client";
import { errorResponse, response } from "@/lib/apiResponse";
import cloudinary from "@/lib/cloudinary";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";
import { createSupplierSchema } from "@/schemas/supplier.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        console.log("Raw FormData:", [...formData.entries()]);

        const body = {
            name: formData.get("name"),
            mobile: formData.get("mobile"),
            email: formData.get("email"),
            address: formData.get("address"),
            role: formData.get("role"),
            company: formData.get("company"),
            type: formData.get("type")
                ? JSON.parse(formData.get("type") as string)
                : [],
            avatar: formData.get("avatar"),
        };

        // console.log("Converted object:", body);
        const parsed = createSupplierSchema.parse(body);
        // console.log("After parsing:", parsed);

        let uploadedImage = null;

        if (parsed.avatar?.size) {
            uploadedImage = await uploadImageToCloudinary(parsed.avatar, { folder: "suppliers" });
        }


        console.log(uploadedImage);
        let avatarRecord: Avatars | null = null;

        try {
            await prisma.$transaction(async (tx) => {

                const isEmailAlreadyExist = parsed.email && await tx.profiles.findFirst({
                    where: {
                        email: parsed.email,
                    },
                });

                if (isEmailAlreadyExist) {
                    throwError({
                        message: "Email already used",
                        statusCode: 400,
                    });
                }

                const isMobileAlreadyExist = await tx.profiles.findFirst({
                    where: {
                        mobile: parsed.mobile,
                    },
                });

                if (isMobileAlreadyExist) {
                    throwError({
                        message: "Mobile already used",
                        statusCode: 400,
                    });
                }

                if (uploadedImage) {
                    avatarRecord = await tx.avatars.create({
                        data: uploadedImage,
                    });
                }

                const profile = await tx.profiles.create({
                    data: {
                        name: parsed.name,
                        mobile: parsed.mobile,
                        email: parsed.email ?? undefined,
                        address: parsed.address ?? undefined,
                        role: UserRole.SUPPLIER,
                        avatar_id: avatarRecord?.id,
                    },
                });

                await tx.suppliers.create({
                    data: {
                        profile_id: profile.id,
                        company: parsed.company ?? undefined,
                        type: parsed.type,
                        role: parsed.role,
                    },
                });
            });
        } catch (err) {
            // Cleanup Cloudinary if DB transaction fails
            if (uploadedImage?.public_id) {
                await cloudinary.uploader.destroy(uploadedImage.public_id);
            }

            throw err;
        }

        return response({
            message: "Supplier created successfully",
        });
    } catch (error) {
        return errorResponse(error);
    }
}