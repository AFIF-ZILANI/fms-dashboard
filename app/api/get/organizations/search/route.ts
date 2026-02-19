import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const q = searchParams.get("q");

        if (!q || typeof q !== "string") {
            throwError({
                message: "Query is required",
                statusCode: 400,
            })
        }
        const organizations = await prisma.organization.findMany({
            where: {
                normalized_key: {
                    contains: q.toLowerCase().trim(),
                },
            },
            select: {
                id: true,
                label_name: true,
                // itemLinks: {
                //     select: {
                //         role: true,
                //     }
                // }
            }
        });

        console.log("organizations", organizations);
        if (!organizations.length) {
            throwError({
                message: "No organizations found",
                statusCode: 404,
            })
        }
        const formatedOrganizations = organizations.map((organization) => ({
            id: organization.id,
            labelName: organization.label_name,
        }));


        return response({
            message: "Organizations fetched successfully",
            data: formatedOrganizations,
        });
    } catch (error) {
        return errorResponse(error);
    }
}