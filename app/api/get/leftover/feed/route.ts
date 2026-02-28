import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.houseFeedInventory.findMany({})

        if (!data) {
            throwError({
                message: "No data found",
                statusCode: 404
            })
        }

        return response({
            data,
            message: "Data fetched successfully"
        })
    } catch (error) {
        return errorResponse(error)
    }
}