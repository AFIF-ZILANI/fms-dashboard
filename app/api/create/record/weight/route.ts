import { errorResponse, response } from "@/lib/apiResponse";
import { getFarmDateTime } from "@/lib/date-time";
import { assertHouseHasRunningBatchFast } from "@/lib/db";
import { throwError } from "@/lib/error";
import { GetAdminID } from "@/lib/get-admin";
import prisma from "@/lib/prisma";
import { addWeightRecordSchema } from "@/schemas/weight-record.schema";
import { NextRequest } from "next/server";

// const DEV_ADMIN_PROFILE_UUID = "234dd176-e4a2-46c8-b98b-0f129f3b2944"; // only for dev env
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = addWeightRecordSchema.parse(body);

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

            const allocation = await assertHouseHasRunningBatchFast(tx, data.houseId)

            if (!allocation) {
                throwError({
                    message:
                        "No active batch found for this house at this time.",
                    statusCode: 400,
                });
            }

            await tx.weightRecords.create({
                data: {
                    batch: {
                        connect: {
                            id: allocation.batch_id,
                        },
                    },
                    house: {
                        connect: {
                            id: data.houseId,
                        },
                    },
                    sample_size: data.sampleSize,
                    farm_date: getFarmDateTime(data.occurredAt),
                    average_wt_grams: data.avgWeightInGrams,
                    date: new Date(),
                    measured_by: {
                        connect: {
                            id: DEV_ADMIN_PROFILE_UUID,
                        },
                    },
                },
            });
        });

        return response({
            message: "weight record added successfully!",
        });
    } catch (error) {
        return errorResponse(error);
    }
}
