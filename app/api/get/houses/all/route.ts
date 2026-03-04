import { Houses as PrismaHouses } from "@/app/generated/prisma/client";
import { errorResponse, response } from "@/lib/apiResponse";
import { assertManyHouseHasRunningBatchFast } from "@/lib/db";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { House } from "@/types";

export async function GET() {
    try {
        let houses: PrismaHouses[] = [];
        let batchHouseBalances: { house_id: string; batch_id: string; quantity: number }[] = [];
        await prisma.$transaction(async (tx) => {
            houses = await tx.houses.findMany({});

            if (!houses) {
                throwError({
                    message: "houses not found at this time",
                });
            }

            const houseIds = houses.map((h) => h.id);
            batchHouseBalances = await assertManyHouseHasRunningBatchFast(tx, houseIds)
        })
        const data: House[] = [];
        houses.map((h) =>
            data.push({
                id: h.id,
                label: h.name,
                houseNumber: h.number,
                name: h.name,
                type: h.type,
                runningBatchId: batchHouseBalances.find((b) => b.house_id === h.id)?.batch_id ?? null,
            })
        );



        console.log("[DATA FROM HOUSES API (/get/houses/all)] => ", data);
        return response({
            message: "All houses data fetched",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
