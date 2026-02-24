import {
    LocationType,
    RefType,
    StockDirection,
    StockReason,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays, getFarmDateTime } from "@/lib/date-time";
import { assertHouseHasRunningBatchFast, assertHouseIdsValid } from "@/lib/db";
import { throwError } from "@/lib/error";
import { GetAdminID } from "@/lib/get-admin";
import prisma from "@/lib/prisma";
import { addHouseEventSchema } from "@/schemas/event.schema";
import { HouseEventEnum } from "@/types/enum";
import { NextRequest } from "next/server";

// const DEV_ADMIN_PROFILE_UUID = "234dd176-e4a2-46c8-b98b-0f129f3b2944"; // only for dev env
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            houseId,
            occurredAt,
            quantity,
            unit,
            eventType,
            leftOverFeedQty
        } = addHouseEventSchema.parse(body);

        const adminId = await GetAdminID();

        if (!adminId) {
            throwError({
                message: "Admin not found",
                statusCode: 404,
            });
        }

        if (quantity <= 0) {
            throwError({
                message: "Quantity must be greater than 0",
                statusCode: 400,
            });
        }

        if (
            leftOverFeedQty !== undefined &&
            (leftOverFeedQty < 0 || leftOverFeedQty > 50)
        ) {
            throwError({
                message: "Left over feed quantity must be between 0 and 50kg",
                statusCode: 400,
            });
        }

        if (
            eventType === HouseEventEnum.FEED &&
            leftOverFeedQty !== undefined &&
            leftOverFeedQty > quantity
        ) {
            throwError({
                message: "Left over feed cannot exceed fed quantity",
                statusCode: 400,
            });
        }

        await prisma.$transaction(async (tx) => {
            await assertHouseIdsValid(tx, [houseId]);

            const batchHouse = await assertHouseHasRunningBatchFast(tx, houseId);

            if (!batchHouse?.batch_id) {
                throwError({
                    message: "House has no running batch",
                    statusCode: 404,
                });
            }

            const batch = await tx.batches.findUnique({
                where: { id: batchHouse.batch_id },
                select: {
                    id: true,
                    starting_date: true,
                },
            });

            if (!batch) {
                throwError({
                    message: "Batch not found",
                    statusCode: 404,
                });
            }

            // 1️⃣ Create House Event
            await tx.houseEvents.create({
                data: {
                    batch: {
                        connect: {
                            id: batch.id,
                        }
                    },
                    house: {
                        connect: {
                            id: houseId,
                        }
                    },
                    quantity,
                    unit,
                    event_type: eventType,
                    farm_date: getFarmDateTime(occurredAt),
                    occurred_at: occurredAt,
                    created_by: {
                        connect: {
                            id: adminId,
                        }
                    },
                },
            });

            if (eventType === HouseEventEnum.FEED) {

                const age = getBatchAgeInDays(
                    batch.starting_date,
                    occurredAt
                );

                const feedProgram = await tx.batchFeedingProgram.findFirst({
                    where: {
                        batch_id: batch.id,
                        start_day: { lte: age },
                        OR: [
                            { end_day: null },
                            { end_day: { gte: age } },
                        ],
                    },
                    select: { item_id: true },
                });

                if (!feedProgram?.item_id) {
                    throwError({
                        message:
                            "Feed item not configured for this batch at this age",
                        statusCode: 500,
                    });
                }

                // 2️⃣ Create Consumption Record
                const consumption = await tx.consumption.create({
                    data: {
                        batch_id: batch.id,
                        house_id: houseId,
                        item_id: feedProgram.item_id,
                        quantity,
                        date: occurredAt,
                        note: "Feed added during event",
                    },
                });

                // 3️⃣ Ledger entry (House consumption)
                await tx.stockLedger.create({
                    data: {
                        item_id: feedProgram.item_id,
                        idempotency_key: `house-consumption-${consumption.id}-${houseId}`,
                        quantity,
                        direction: StockDirection.OUT,
                        reason: StockReason.CONSUMPTION,
                        occurred_at: occurredAt,
                        ref_type: RefType.CONSUMPTION,
                        ref_id: consumption.id,
                        location_type: LocationType.HOUSE,
                        location_id: houseId,
                    },
                });

                // 4️⃣ Update leftover inventory (allow 0)
                if (leftOverFeedQty !== undefined) {
                    await tx.houseFeedInventory.upsert({
                        where: {
                            house_id_item_id: {
                                house_id: houseId,
                                item_id: feedProgram.item_id,
                            },
                        },
                        update: {
                            quantity_remaining: leftOverFeedQty,
                            last_modified_by: adminId,
                        },
                        create: {
                            house_id: houseId,
                            item_id: feedProgram.item_id,
                            quantity_remaining: leftOverFeedQty,
                            last_modified_by: adminId,
                        },
                    });
                }
            }
        });

        return response({
            message: "Event created successfully",
        });

    } catch (error) {
        return errorResponse(error);
    }
}