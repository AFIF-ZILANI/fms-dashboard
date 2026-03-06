import { AllocationReason, BatchStatus, FeedType, PaymentRefType, PaymentStatus, PaymentType, Phase, UserRole } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { generateBatchId, getLastBatchNumber } from "@/lib/batch-utils";
import { createBatchHouseAllocationWithBalanceUpdate } from "@/lib/db";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { addBatchSchema } from "@/schemas/batch.schema";

import { NextRequest } from "next/server"; // Use NextResponse for proper response object


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { initChicksAvgWT, initialQuantity, date, supplierId, breed, feedId, allocation, payment, paymentStatus, unitPrice } = addBatchSchema.parse(body);

        const parsedDate = new Date(date);
        if (parsedDate.getTime() > Date.now()) {
            throwError({
                message:
                    "Invalid 'date'. Cannot start a batch in the future.",
                statusCode: 400,
            });
        }
        const totalHouseAllocationQty = allocation.reduce((acc, curr) => acc + curr.quantity, 0);
        if (totalHouseAllocationQty !== initialQuantity) {
            throwError({
                message:
                    "Total house allocation quantity must be equal to initial quantity",
                statusCode: 400,
            });
        }

        const totalPrice = unitPrice * initialQuantity;
        const startingDate = parsedDate;
        const EXPECTED_DAYS = 60; // Define the constant here
        // Create a *copy* of the startingDate object to manipulate
        const expectedSellingDate = new Date(startingDate);

        // Get the current day of the month, add 60 days to it, and set the new date.
        // JavaScript automatically handles month and year rollovers (e.g., adding 60 days to Dec 15 rolls over to Feb 13).
        expectedSellingDate.setDate(startingDate.getDate() + EXPECTED_DAYS);

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
        // --- * ---

        await prisma.$transaction(async (tx) => {
            const uniqueHouseIds = new Set(allocation.map(a => a.houseId));
            if (uniqueHouseIds.size !== allocation.length) {
                throwError({
                    message: "Duplicate house id",
                    statusCode: 400,
                });
            }
            const dbHouses = await tx.houses.findMany({
                where: { id: { in: [...uniqueHouseIds] } }
            });

            if (dbHouses.length !== uniqueHouseIds.size) {
                throwError({
                    message: "Invalid house id",
                    statusCode: 400,
                });
            }

            const dbSupplier = await tx.suppliers.findUnique({
                where: { id: supplierId },
            });

            if (!dbSupplier) {
                throwError({
                    message: "Invalid supplier id",
                    statusCode: 400,
                });
            }
            const runningBatches = await tx.batches.findMany({
                where: {
                    status: BatchStatus.RUNNING,
                },
                select: {
                    id: true,
                },
            });

            // at a single time farm can run only 2 batches
            if (runningBatches.length >= 2) {
                throwError({
                    message:
                        "Farm is running in full capacity. Can't add more batch",
                    statusCode: 400,
                });
            }

            const { toInstrumentId, fromInstrumentId, paidAmount, handledById } = payment;
            if (paymentStatus === "UNPAID" && payment) {
                throwError({
                    message: "Invalid payment",
                    statusCode: 400,
                });
            }
            if (paymentStatus === "PAID" || paymentStatus === "PARTIAL") {
                if (!toInstrumentId || !fromInstrumentId) {
                    throwError({
                        message: "Payment instrument is required",
                        statusCode: 400,
                    });
                }

                if (paymentStatus === "PARTIAL" && (paidAmount <= 0 || paidAmount >= totalPrice)) {
                    throwError({
                        message: "Payment amount must be greater than 0 and less than total amount for partial payment",
                        statusCode: 400,
                    });
                }

                if (paymentStatus === "PAID" && paidAmount !== totalPrice) {
                    throwError({
                        message: "Payment amount must be equal to total amount for paid payment",
                        statusCode: 400,
                    });
                }

                const toInstrument = await tx.paymentInstrument.findUnique({
                    where: { id: toInstrumentId },
                });
                if (!toInstrument) {
                    throwError({
                        message: "Invalid payment instrument",
                        statusCode: 400,
                    });
                }
                const fromInstrument = await tx.paymentInstrument.findUnique({
                    where: { id: fromInstrumentId },
                });
                if (!fromInstrument) {
                    throwError({
                        message: "Invalid payment instrument",
                        statusCode: 400,
                    });
                }

                if (toInstrument.type !== fromInstrument.type) {
                    throwError({
                        message: "Payment instrument type must be same",
                        statusCode: 400,
                    });
                }

                const handledBy = await tx.profiles.findFirst({
                    where: {
                        id: handledById,
                        role: UserRole.ADMIN
                    },
                });
                if (!handledBy) {
                    throwError({
                        message: "Invalid handled by",
                        statusCode: 400,
                    });
                }
            }

            const newBatch = await tx.batches.create({
                data: {
                    batch_id,
                    breed: breed,
                    starting_date: parsedDate,
                    init_chicks_avg_wt: initChicksAvgWT,
                    phase: Phase.BROODER,
                    initial_quantity: initialQuantity,
                    farm_code: farmCode,
                    product_code: productCode,
                    sector_code: sectorCode,
                    expected_selling_date: expectedSellingDate,
                },
            });



            // ------------------------
            // Create payment only if needed
            // ------------------------
            if (paymentStatus !== PaymentStatus.UNPAID) {
                await tx.payment.create({
                    data: {
                        payment_date: new Date(payment!.paymentDate),
                        amount: payment!.paidAmount,
                        direction: PaymentType.OUTGOING,
                        ref_type: PaymentRefType.PURCHASE,
                        ref_id: newBatch.id,
                        from_instrument_id: payment!.fromInstrumentId,
                        to_instrument_id: payment!.toInstrumentId,
                        handled_by_id: payment!.handledById,
                        note: payment!.note,
                    },
                });
            }

            await tx.batchSuppliers.create({
                data: {
                    batch_id: newBatch.id,
                    supplier_id: supplierId,
                    quantity: initialQuantity,
                    price_per_chicks: unitPrice,
                    delivery_date: parsedDate,
                },
            })




            for (const alloc of allocation) {
                const lastAllocation = await tx.batchHouseAllocation.findFirst({
                    where: {
                        to_house_id: alloc.houseId,
                        occurred_at: {
                            lt: parsedDate,
                        },
                    },
                    orderBy: {
                        occurred_at: "desc",
                    },
                    select: {
                        occurred_at: true,
                    },
                });

                await createBatchHouseAllocationWithBalanceUpdate(tx, {
                    batchId: newBatch.id,
                    fromHouseId: null,
                    toHouseId: alloc.houseId,
                    quantity: alloc.quantity,
                    reason: AllocationReason.INITIAL,
                    occurredAt: parsedDate,
                })

                await tx.consumption.updateMany({
                    where: {
                        house_id: alloc.houseId,
                        batch_id: null,
                        date: {
                            ...(lastAllocation
                                ? { gt: lastAllocation.occurred_at }
                                : {}),
                            lt: parsedDate,
                        },
                    },
                    data: {
                        batch_id: newBatch.id,
                    },
                });
            }

            const feed = await tx.item.findFirst({
                where: {
                    id: feedId,
                },
            });

            if (!feed) {
                throwError({
                    message: "Invalid feed id",
                    statusCode: 400,
                });
            }

            await tx.batchFeedingProgram.create({
                data: {
                    batch_id: newBatch.id,
                    item_id: feedId,
                    feed_type: FeedType.STARTER,
                    start_day: 1,
                }
            })

        });



        return response({
            message: "Successfully batch created!",
        });
    } catch (error) {
        console.log(error);
        return errorResponse(error);
    }
}
