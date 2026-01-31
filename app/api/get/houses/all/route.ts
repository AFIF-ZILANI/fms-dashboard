import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const houses = await prisma.houses.findMany({});

        if (!houses) {
            throwError({
                message: "houses not found at this time",
            });
        }
        const data: { id: string; label: string }[] = [];
        houses.map((h) =>
            data.push({
                id: h.id,
                label: `${h.name} - ${h.number} - ${h.type}`,
            })
        );
        return response({
            message: "All houses data fetched",
            data: { houses: data },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
