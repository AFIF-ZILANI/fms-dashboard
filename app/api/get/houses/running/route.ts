import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays } from "@/lib/date-time";
import { getHouseBatchBalancesFast } from "@/lib/db";
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

            if (!allocation.length) {
                throwError({
                    message:
                        "No active batch found for this house at this time.",
                    statusCode: 400,
                });
            }

            const houseIds = allocation.map((i) => i.to_house_id).filter((i) => i !== null) as string[];
            const balance = await getHouseBatchBalancesFast(tx, {
                houseIds: houseIds,
            });

            allocation.map(async (al) => {
                const h = al.to_house
                if (!h) return;
                const hasHouseQty = balance.find((b) => b.house_id === h.id)?.quantity || 0;
                if (hasHouseQty <= 0) return;
                data.houses.push({
                    id: h.id,
                    qty: hasHouseQty,
                    label: h.name,
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

