import {
    LocationType,
    RefType,
    StockDirection,
    StockReason,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays, getFarmDateTime } from "@/lib/date-time";
import { assertHouseHasRunningBatch, assertHouseIdsValid } from "@/lib/db";
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
        const { houseId, occurredAt, quantity, unit, eventType } = addHouseEventSchema.parse(body);

        const DEV_ADMIN_PROFILE_UUID = await GetAdminID();

        await prisma.$transaction(async (tx) => {
            await assertHouseIdsValid(tx, [houseId]);

            const batchHouse = await assertHouseHasRunningBatch(tx, houseId, occurredAt);
            const batch = await tx.batches.findUnique({
                where: {
                    id: batchHouse.batch_id,
                },
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
            const houseEvent = await tx.houseEvents.create({
                data: {
                    batch: {
                        connect: {
                            id: batchHouse.batch_id,
                        },
                    },
                    house: {
                        connect: {
                            id: houseId,
                        },
                    },
                    quantity: quantity,
                    unit: unit,
                    event_type: eventType,
                    farm_date: getFarmDateTime(occurredAt),
                    occurred_at: occurredAt,
                    created_by: {
                        connect: {
                            id: DEV_ADMIN_PROFILE_UUID,
                        },
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
                        batch_id: batchHouse.batch_id,
                        start_day: {
                            lte: age,
                        },

                        OR: [
                            { end_day: null },
                            {
                                end_day: {
                                    gte: age,
                                },
                            },
                        ],
                    },
                    select: {
                        item_id: true,
                    },
                });

                if (!feedProgram?.item_id) {
                    throwError({
                        message:
                            "Item id not found for this batch at this time",
                        statusCode: 500,
                    });
                }

                await tx.stockLedger.create({
                    data: {
                        item_id: feedProgram.item_id,
                        idempotency_key: `House-Event:${houseEvent.id}:${feedProgram.item_id}`,
                        quantity: quantity,
                        direction: StockDirection.OUT,
                        reason: StockReason.CONSUMPTION,
                        occurred_at: occurredAt,
                        ref_type: RefType.HOUSE_EVENT,
                        ref_id: houseEvent.id,
                    },
                });
                await tx.stockLedger.create({
                    data: {
                        item_id: feedProgram.item_id,
                        idempotency_key: `House-Event:${houseEvent.id}:${feedProgram.item_id}`,
                        quantity: quantity,
                        direction: StockDirection.OUT,
                        reason: StockReason.CONSUMPTION,
                        occurred_at: occurredAt,
                        ref_type: RefType.HOUSE_EVENT,
                        ref_id: houseEvent.id,
                        from_location_type: LocationType.HOUSE,
                        from_location_id: houseId,
                        to_location_type: null,
                        to_location_id: null,
                    },
                });
            }
        });
        return response({
            message: "Event Created successfully!",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
