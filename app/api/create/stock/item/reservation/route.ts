import {
    LocationType,
    StockDirection,
    StockReason,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { assertHouseHasRunningBatchFast, assertHouseIdsValid } from "@/lib/db";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { addStockReservationSchema } from "@/schemas/item.schema";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { houseId, itemId, quantity, occurredAt, note } = addStockReservationSchema.parse(body);

        await prisma.$transaction(async (tx) => {
            await assertHouseIdsValid(tx, [houseId]);
            const batchHouse = await assertHouseHasRunningBatchFast(tx, houseId);

            // console.log("[BATCH HOUSE DATA] => ", batchHouse);

            const item = await prisma.$queryRaw<{ stock: number }[]>`
      SELECT 
        SUM(
          CASE 
            WHEN direction = 'IN' THEN quantity
            WHEN direction = 'OUT' THEN -quantity
          END
        ) AS stock
      FROM "StockLedger"
      WHERE item_id = ${itemId};
    `;

            if (!item || item[0].stock < quantity) {
                throwError({
                    message: "this item is not able to consume at this time",
                    statusCode: 400,
                });
            }

            const reservation = await tx.stockReservation.create({
                data: {
                    house: {
                        connect: {
                            id: houseId,
                        },
                    },
                    batch: batchHouse?.batch_id ? { connect: { id: batchHouse.batch_id } } : undefined,
                    quantity: quantity,
                    date: occurredAt!,
                    note: note?.trim() ?? null,
                },
            });

            if (!reservation) {
                throwError({
                    message: "Row creation faild in stock reservation table",
                });
            }

            await tx.stockLedger.create({
                data: {
                    item: {
                        connect: {
                            id: itemId,
                        },
                    },
                    quantity: quantity,
                    from_location_type: LocationType.WAREHOUSE,
                    to_location_type: LocationType.HOUSE,
                    to_location_id: houseId,
                    reason: StockReason.TRANSFER,
                    direction: StockDirection.IN,
                    occurred_at: occurredAt,
                    idempotency_key: `${StockReason.TRANSFER}:${reservation.id}:${itemId}`,
                },
            });
        });
        return response({
            message: "Item consumption recorded successfully!i",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
