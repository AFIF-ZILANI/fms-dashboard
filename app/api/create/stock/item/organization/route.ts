import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { normalizeOrgNameEnBnAggressive } from "@/lib/strings";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { organizationName } = body;

        if (!organizationName) {
            throwError({
                message: "Organization name is required",
                statusCode: 400,
            });
        }

        const normalizedKey = normalizeOrgNameEnBnAggressive(organizationName);

        console.log("organizationName", organizationName);
        console.log("normalizedKey", normalizedKey);
        const organization = await prisma.organization.create({
            data: {
                label_name: organizationName,
                normalized_key: normalizedKey,
            },
        });
        console.log("organization", organization);
        return response({
            message: "Organization created successfully",
            data: organization,
        });
    } catch (error) {
        return errorResponse(error);
    }
}