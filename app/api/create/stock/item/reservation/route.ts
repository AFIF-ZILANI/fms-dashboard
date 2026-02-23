import {
    LocationType,
    RefType,
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

            if (quantity <= 0) {
                throwError({
                    message: "Quantity must be greater than zero",
                    statusCode: 400,
                });
            }

            // Validate warehouse stock only
            const stockResult = await tx.$queryRaw<{ stock: number | null }[]>`
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

            const warehouseStock = Number(stockResult[0]?.stock ?? 0);

            if (warehouseStock < quantity) {
                throwError({
                    message: "Insufficient warehouse stock for reservation",
                    statusCode: 400,
                });
            }

            // Create reservation (intent)
            const reservation = await tx.stockReservation.create({
                data: {
                    house: { connect: { id: houseId } },
                    batch: batchHouse?.batch_id
                        ? { connect: { id: batchHouse.batch_id } }
                        : undefined,
                    item: { connect: { id: itemId } },
                    quantity,
                    date: occurredAt!,
                    note: note?.trim() ?? null,
                },
            });

            // Transfer OUT from warehouse
            await tx.stockLedger.create({
                data: {
                    item: { connect: { id: itemId } },
                    quantity,
                    location_type: LocationType.WAREHOUSE,
                    location_id: null,
                    direction: StockDirection.OUT,
                    reason: StockReason.TRANSFER,
                    occurred_at: occurredAt,
                    idempotency_key: `TRANSFER_OUT:${reservation.id}:${itemId}`,
                    ref_id: reservation.id,
                    ref_type: RefType.STOCK_RESERVATION,
                },
            });

            // Transfer IN to house
            await tx.stockLedger.create({
                data: {
                    item: { connect: { id: itemId } },
                    quantity,
                    location_type: LocationType.HOUSE,
                    location_id: houseId,
                    direction: StockDirection.IN,
                    reason: StockReason.TRANSFER,
                    occurred_at: occurredAt,
                    idempotency_key: `TRANSFER_IN:${reservation.id}:${itemId}`,
                    ref_id: reservation.id,
                    ref_type: RefType.STOCK_RESERVATION,
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
