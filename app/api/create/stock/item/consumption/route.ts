import {
    LocationType,
    RefType,
    StockDirection,
    StockReason,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { assertHouseHasRunningBatchFast, assertHouseIdsValid, getHouseItemReservationBalance } from "@/lib/db";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { recordItemUsageSchema } from "@/schemas/item-usage.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { houseId, itemId, quantity, occurredAt, note } = recordItemUsageSchema.parse(body);

        await prisma.$transaction(async (tx) => {
            await assertHouseIdsValid(tx, [houseId]);
            const batchHouse = await assertHouseHasRunningBatchFast(tx, houseId);

            const reserved = await getHouseItemReservationBalance(tx, {
                houseId,
                itemIds: [itemId],
            });

            const reservedQty = Number(reserved?.[0]?.alive_reserved_qty ?? 0);

            let remainingQty = quantity;

            // Create consumption record
            const consumption = await tx.consumption.create({
                data: {
                    house: { connect: { id: houseId } },
                    batch: batchHouse?.batch_id
                        ? { connect: { id: batchHouse.batch_id } }
                        : undefined,
                    quantity,
                    item: { connect: { id: itemId } },
                    date: occurredAt,
                    note: note?.trim() ?? null,
                },
            });

            // 1️⃣ Consume from HOUSE (if reserved exists)
            if (reservedQty > 0) {
                const consumeFromHouse = Math.min(reservedQty, remainingQty);

                await tx.stockLedger.create({
                    data: {
                        item: { connect: { id: itemId } },
                        quantity: consumeFromHouse,
                        reason: StockReason.CONSUMPTION,
                        direction: StockDirection.OUT,
                        occurred_at: occurredAt,
                        idempotency_key: `CONSUMPTION_HOUSE:${consumption.id}:${itemId}`,
                        ref_id: consumption.id,
                        ref_type: RefType.CONSUMPTION,
                        location_type: LocationType.HOUSE,
                        location_id: houseId,
                    },
                });

                remainingQty -= consumeFromHouse;
            }

            // 2️⃣ Consume remaining from WAREHOUSE (if needed)
            if (remainingQty > 0) {
                const warehouseStockResult = await tx.$queryRaw<{ stock: number | null }[]>`
      SELECT COALESCE(SUM(
        CASE 
          WHEN direction = 'IN' THEN quantity
          WHEN direction = 'OUT' THEN -quantity
        END
      ), 0) AS stock
      FROM "StockLedger"
      WHERE item_id = ${itemId}
        AND location_type = 'WAREHOUSE';
    `;

                const warehouseStock = Number(warehouseStockResult[0]?.stock ?? 0);

                if (warehouseStock < remainingQty) {
                    throwError({
                        message: "Insufficient warehouse stock",
                        statusCode: 400,
                    });
                }

                await tx.stockLedger.create({
                    data: {
                        item: { connect: { id: itemId } },
                        quantity: remainingQty,
                        reason: StockReason.CONSUMPTION,
                        direction: StockDirection.OUT,
                        occurred_at: occurredAt,
                        idempotency_key: `CONSUMPTION_WAREHOUSE:${consumption.id}:${itemId}`,
                        ref_id: consumption.id,
                        ref_type: RefType.CONSUMPTION,
                        location_type: LocationType.WAREHOUSE,
                        location_id: null,
                    },
                });
            }
        });
        return response({
            message: "Item consumption recorded successfully!i",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
