import { AllocationReason, BatchStatus, Phase } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { generateBatchId, getLastBatchNumber } from "@/lib/batch-utils";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { addBatchSchema } from "@/schemas/batch.schema";

import { NextRequest } from "next/server"; // Use NextResponse for proper response object


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { initChicksAvgWT, initialQuantity, date, suppliers, breed } = addBatchSchema.parse(body);

        const runningBatches = await prisma.batches.findMany({
            where: {
                status: BatchStatus.RUNNING,
            },
            select: {
                id: true,
            },
        });
        if (runningBatches.length > 1) {
            throwError({
                message:
                    "Farm is running in full capacity. Can't add more batch",
                statusCode: 400,
            });
        }

        if (date > new Date()) {
            throwError({
                message:
                    "Invalid 'date'. Cannot start a batch in the future.",
                statusCode: 400,
            });
        }
        const startingDate = date;
        const EXPECTED_DAYS = 60; // Define the constant here
        // Create a *copy* of the startingDate object to manipulate
        const expectedSellingDate = new Date(startingDate);

        // Get the current day of the month, add 60 days to it, and set the new date.
        // JavaScript automatically handles month and year rollovers (e.g., adding 60 days to Dec 15 rolls over to Feb 13).
        expectedSellingDate.setDate(startingDate.getDate() + EXPECTED_DAYS);

        suppliers.map(async (sup) => {
            const supplier = await prisma.suppliers.findFirst({
                where: {
                    id: sup.id,
                },
            });
            if (!supplier) {
                throwError({
                    message: "Invalid supplier id",
                    statusCode: 400,
                });
            }
        });

        const farmCode = "F01";
        const sectorCode = "POU";
        const productCode = breed.slice(0, 3);
        const lastBatchNo = await getLastBatchNumber(farmCode, sectorCode);
        const batch_id = generateBatchId(
            farmCode,
            sectorCode,
            productCode,
            lastBatchNo
        );
        // Because there is only one BROODER house our farm has so, currently I hard code house ID
        const HOUSE_ID = "f8e7d6c5-b4a3-4210-9876-543210fedcba";
        // --- * ---

        await prisma.$transaction(async (tx) => {
            const newBatch = await tx.batches.create({
                data: {
                    batch_id,
                    breed: breed,
                    starting_date: new Date(date),
                    init_chicks_avg_wt: initChicksAvgWT,
                    phase: Phase.BROODER,
                    initial_quantity: initialQuantity,
                    farm_code: farmCode,
                    product_code: productCode,
                    sector_code: sectorCode,
                    expected_selling_date: expectedSellingDate,
                },
            });

            await tx.batchHouseAllocation.create({
                data: {
                    batch: {
                        connect: {
                            id: newBatch.id,
                        },
                    },
                    to_house: {
                        connect: {
                            id: HOUSE_ID,
                        },
                    },
                    reason: AllocationReason.INITIAL,
                    quantity: newBatch.initial_quantity,
                    occurred_at: date,
                },
            });

            await Promise.all(
                suppliers.map((sup) =>
                    tx.batchSuppliers.create({
                        data: {
                            batch_id: newBatch.id,
                            supplier_id: sup.id,
                            quantity: sup.quantity,
                            price_per_chicks: sup.unitPrice,
                            delivery_date: new Date(sup.deliveryDate),
                        },
                    })
                )
            );

            const lastAllocation = await tx.batchHouseAllocation.findFirst({
                where: {
                    to_house_id: HOUSE_ID,
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
                    house_id: HOUSE_ID,
                    batch_id: null,
                    date: {
                        ...(lastAllocation
                            ? { gt: lastAllocation.occurred_at }
                            : {}),
                        lt: date,
                    },
                },
                data: {
                    batch_id: newBatch.id,
                },
            });

        });



        return response({
            message: "Successfully batch created!",
        });
    } catch (error) {
        console.log(error);
        return errorResponse(error);
    }
}
