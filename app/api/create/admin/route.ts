import { UserRole } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import cloudinary from "@/lib/cloudinary";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";
import { addAdminProfileSchema } from "@/schemas/admin.schema";
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
        const parsed = addAdminProfileSchema.parse(body);
        // console.log("After parsing:", parsed);

        const uploadedImage = await uploadImageToCloudinary(parsed.avatar, { folder: "admins" });

        if (!uploadedImage) {
            throwError({
                message: "Image upload failed",
                statusCode: 400,
            })
        }

        console.log(uploadedImage);

        try {
            await prisma.$transaction(async (tx) => {

                const avatar = await tx.avatars.create({
                    data: {
                        public_id: uploadedImage.public_id,
                        image_url: uploadedImage.image_url,

                    },
                });

                if (!avatar) {
                    throwError({
                        message: "Recording avatar data on database failed",
                        statusCode: 400,
                    })
                }

                const isEmailAlreadyExist = await tx.profiles.findFirst({
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

                const mobileAlreadyExist = await tx.profiles.findFirst({
                    where: {
                        mobile: parsed.mobile,
                    },
                });

                if (mobileAlreadyExist) {
                    throwError({
                        message: "Mobile number already used",
                        statusCode: 400,
                    });
                }



                const profile = await tx.profiles.create({
                    data: {
                        name: parsed.name,
                        mobile: parsed.mobile,
                        address: parsed.address,
                        email: parsed.email,
                        avatar_id: avatar.id,
                        role: UserRole.ADMIN,
                    },
                });

                await tx.admins.create({
                    data: {
                        profile_id: profile.id,
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
            message: "Admin added successfully!",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
