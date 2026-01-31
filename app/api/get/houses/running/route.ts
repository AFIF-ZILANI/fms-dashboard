import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays } from "@/lib/date-time";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { GetHouses } from "@/types";

export async function GET() {
    try {
        const data: GetHouses = {
            houses: [],
        };
        await prisma.$transaction(async (tx) => {
            const houses = await tx.houses.findMany({
                select: {
                    id: true,
                },
            });

            if (!houses.length) {
                throwError({
                    statusCode: 400,
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
            console.log("[ALLOCATION] => ", allocation);

            if (!allocation.length) {
                throwError({
                    message:
                        "No active batch found for this house at this time.",
                    statusCode: 400,
                });
            }

            allocation.map((al) => {
                const h = al.to_house
                if (!h) return;
                data.houses.push({
                    id: h.id,
                    label: `${h.name} - ${h.number} - ${h.type}`,
                    runningBatch: `${al.batch.breed} - ${getBatchAgeInDays(al.batch.starting_date)} Days - ${al.batch.phase}`,
                });
            });
        });

        console.log("[DATA] => ", data);
        return response({
            message: "successfully data fetched",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

