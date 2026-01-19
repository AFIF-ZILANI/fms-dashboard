import { StockReason } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { addInitialItemSchema } from "@/schemas/item.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = addInitialItemSchema.parse(body);

        await prisma.$transaction(async (tx) => {
            const isItemValid = await tx.item.findFirst({
                where: {
                    id: data.itemId,
                },
            });

            if (!isItemValid) {
                throwError({
                    message: "Invalid Item id",
                    statusCode: 400,
                });
            }

            await tx.stockLedger.create({
                data: {
                    item_id: data.itemId,
                    quantity: data.quantity,
                    reason: StockReason.OPENING_BALANCE,
                    unit_cost: data.unitCost,
                    occurred_at: data.date,
                    idempotency_key: `OPENING:${data.itemId}`,
                },
            });
        });
        return response({
            message: "items initial balance added successfully",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
