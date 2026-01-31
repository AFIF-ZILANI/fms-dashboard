import { AllocationReason } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { assertHouseHasRunningBatch, assertHouseIdsValid } from "@/lib/db";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { batchAllocationSchema } from "@/schemas/batch.schema";
import { NextRequest } from "next/server";

/**
 * POST /api/create/batch/allocation
 * Handles the transfer of poultry batches between houses. 
 * Validates house availability and ensures quantity constraints are met based on allocation type.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fromHouseId, toHouseId, date, allocationType, quantity } = batchAllocationSchema.parse(body);

        await prisma.$transaction(async (tx) => {
            // Validate that both source and destination houses exist
            await assertHouseIdsValid(tx, [fromHouseId, toHouseId]);

            // Verify the source house has an active batch to transfer from
            const sourceBatch = await assertHouseHasRunningBatch(tx, fromHouseId, date);
            if (!sourceBatch) {
                throwError({
                    message: "The source house does not have an active batch for the specified date.",
                    statusCode: 400,
                });
            }

            // Verify the destination house is currently empty
            const destinationBatch = await assertHouseHasRunningBatch(tx, toHouseId, date);
            if (destinationBatch) {
                throwError({
                    message: "The destination house already has an active batch and cannot receive another.",
                    statusCode: 400,
                });
            }

            const availableQty = sourceBatch.qty;

            // Validate quantity based on the type of allocation
            if (allocationType === "PARTIAL") {
                if (quantity >= availableQty) {
                    throwError({
                        message: "Partial transfers must be for a quantity less than the total available in the batch.",
                        statusCode: 400,
                    });
                }
            } else if (allocationType === "FULL") {
                if (quantity > availableQty) {
                    throwError({
                        message: "Transfer quantity cannot exceed the available batch quantity.",
                        statusCode: 400,
                    });
                }
                // TODO: Validate quantity against (availableQty - totalMortality) for full transfers
            }

            // Record the batch allocation/transfer
            await tx.batchHouseAllocation.create({
                data: {
                    from_house_id: fromHouseId,
                    to_house_id: toHouseId,
                    batch_id: sourceBatch.batch_id,
                    quantity: quantity,
                    reason: AllocationReason.TRANSFER,
                    occurred_at: date,
                },
            });

            // Update the consumption records for the source house
            const lastAllocation = await tx.batchHouseAllocation.findFirst({
                where: {
                    OR: [
                        { to_house_id: toHouseId },
                        { from_house_id: fromHouseId },
                    ],
                    occurred_at: {
                        lt: date,
                    },
                },
                orderBy: {
                    occurred_at: "desc",
                },
                select: {
                    occurred_at: true,
                },
            });

            await tx.consumption.updateMany({
                where: {
                    house_id: fromHouseId,
                    batch_id: null,
                    date: {
                        ...(lastAllocation
                            ? { gt: lastAllocation.occurred_at }
                            : {}),
                        lt: date,
                    },
                },
                data: {
                    batch_id: sourceBatch.batch_id,
                },
            });

        });

        return response({
            message: "Batch allocated successfully",
        });
    } catch (error) {
        return errorResponse(error);
    }
}