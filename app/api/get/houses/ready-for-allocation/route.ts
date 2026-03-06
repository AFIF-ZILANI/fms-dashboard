import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        let data: { id: string; label: string }[] = [];
        await prisma.$transaction(async (tx) => {
            const houses = await tx.houses.findMany({});

            if (!houses.length) {
                throwError({
                    statusCode: 404,
                    message: "Houses not found at this time",
                });
            }

            const ids = houses.map((i) => i.id);
            const allocation = await tx.batchHouseAllocation.findMany({
                where: {
                    to_house_id: {
                        in: ids,
                    },
                    occurred_at: {
                        lte: new Date(),
                    },
                },
                include: {
                    batch: {
                        select: {
                            starting_date: true,
                            batch_id: true,
                            breed: true,
                            phase: true,
                        },
                    },
                    to_house: {
                        select: {
                            name: true,
                            number: true,
                            id: true,
                            type: true,
                        },
                    },
                },
            });
            // console.log("[ALLOCATION] => ", allocation);

            const allocatedHouseIds = new Set(allocation.map((al) => al.to_house_id));

            const filteredHouses = houses.filter((h) => !allocatedHouseIds.has(h.id));

            // console.log("[FILTERED HOUSES] => ", filteredHouses);

            data = filteredHouses.map((h) => ({
                id: h.id,
                label: `${h.name} - ${h.number} - ${h.type}`,
            }));


        });
        return response({
            message: "Ready for allocation houses fetched successfully",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}