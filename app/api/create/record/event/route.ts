import {
    LocationType,
    RefType,
    StockDirection,
    StockReason,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays, getFarmDateTime } from "@/lib/date-time";
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
        const data = addHouseEventSchema.parse(body);

        const DEV_ADMIN_PROFILE_UUID = await GetAdminID();

        await prisma.$transaction(async (tx) => {
            const validHouse = await tx.houses.findFirst({
                where: {
                    id: data.houseId,
                },
            });

            if (!validHouse) {
                throwError({
                    message: "Invalid house Id",
                    statusCode: 400,
                });
            }

            const allocation = await tx.batchHouseAllocation.findFirst({
                where: {
                    house_id: data.houseId,

                    start_date: {
                        lte: data.occurredAt,
                    },

                    OR: [
                        { end_date: null },
                        {
                            end_date: {
                                gte: data.occurredAt,
                            },
                        },
                    ],
                },
                select: {
                    batch: {
                        select: {
                            starting_date: true,
                            id: true,
                        },
                    },
                },
            });

            if (!allocation) {
                throwError({
                    message:
                        "No active batch found for this house at this time.",
                    statusCode: 400,
                });
            }

            const houseEvent = await tx.houseEvents.create({
                data: {
                    batch: {
                        connect: {
                            id: allocation.batch.id,
                        },
                    },
                    house: {
                        connect: {
                            id: data.houseId,
                        },
                    },
                    quantity: data.quantity,
                    unit: data.unit,
                    event_type: data.eventType,
                    farm_date: getFarmDateTime(data.occurredAt),
                    occurred_at: data.occurredAt,
                    created_by: {
                        connect: {
                            id: DEV_ADMIN_PROFILE_UUID,
                        },
                    },
                },
            });

            if (data.eventType === HouseEventEnum.FEED) {
                const age = getBatchAgeInDays(
                    allocation.batch.starting_date,
                    data.occurredAt
                );
                const feedProgram = await tx.batchFeedingProgram.findFirst({
                    where: {
                        batch_id: allocation.batch.id,
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
                        quantity: data.quantity,
                        direction: StockDirection.OUT,
                        reason: StockReason.CONSUMPTION,
                        occurred_at: data.occurredAt,
                        ref_type: RefType.HOUSE_EVENT,
                        ref_id: houseEvent.id,
                    },
                });
                await tx.stockLedger.create({
                    data: {
                        item_id: feedProgram.item_id,
                        idempotency_key: `House-Event:${houseEvent.id}:${feedProgram.item_id}`,
                        quantity: data.quantity,
                        direction: StockDirection.OUT,
                        reason: StockReason.CONSUMPTION,
                        occurred_at: data.occurredAt,
                        ref_type: RefType.HOUSE_EVENT,
                        ref_id: houseEvent.id,
                        from_location_type: LocationType.HOUSE,
                        from_location_id: data.houseId,
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
