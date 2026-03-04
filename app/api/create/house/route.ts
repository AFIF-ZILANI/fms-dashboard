import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { addHouseSchema } from "@/schemas/house.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = addHouseSchema.parse(body);

        const newHouse = await prisma.houses.create({
            data: {
                type: data.type,
                name: data.name,
                number: data.houseNumber,
            },
        });

        if (!newHouse) {
            throwError({
                message: "Failed to create house",
                statusCode: 500,
            });
        }

        return response({
            message: "House created successfully",
            data: newHouse,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
