import {
    ExpenseCategory,
    LocationType,
    PaymentRefType,
    PaymentStatus,
    PaymentType,
    RefType,
    StockDirection,
    StockReason,
    UserRole,
} from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { purchaseItemSchema } from "@/schemas/purchase-items.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = purchaseItemSchema.parse(body);

        await prisma.$transaction(async (tx) => {
            // ------------------------
            // Validate supplier
            // ------------------------
            const supplier = await tx.suppliers.findFirst({
                where: {
                    id: data.supplierId,
                },
            });

            if (!supplier) {
                throwError({
                    message: "Invalid supplier selected for this purchase",
                    statusCode: 400,
                });
            }

            // ------------------------
            // Validate payment rules
            // ------------------------
            if (data.paymentStatus === PaymentStatus.UNPAID) {
                if (data.payment) {
                    throwError({
                        message: "Payment provided for unpaid purchase",
                        statusCode: 400,
                    });
                }
            }

            if (data.paymentStatus !== PaymentStatus.UNPAID) {
                if (!data.payment) {
                    throwError({
                        message: "Payment details required",
                        statusCode: 400,
                    });
                }

                const [fromInst, toInst] = await Promise.all([
                    tx.paymentInstrument.findUnique({
                        where: { id: data.payment.fromInstrumentId },
                    }),
                    tx.paymentInstrument.findUnique({
                        where: { id: data.payment.toInstrumentId },
                    }),
                ]);

                if (!fromInst) {
                    throwError({
                        message: "Invalid from payment instrument",
                        statusCode: 400,
                    });
                }

                if (!toInst) {
                    throwError({
                        message: "Invalid to payment instrument",
                        statusCode: 400,
                    });
                }

                if (data.payment.handledById) {
                    const handler = await tx.profiles.findFirst({
                        where: {
                            id: data.payment.handledById,
                            role: UserRole.ADMIN,
                        },
                    });

                    if (!handler) {
                        throwError({
                            message: "Invalid handler selected",
                            statusCode: 400,
                        });
                    }
                }
            }

            // ------------------------
            // Validate all items in one query
            // ------------------------
            const itemIds = data.items.map((i) => i.itemId);

            const dbItems = await tx.item.findMany({
                where: { id: { in: itemIds } },
                select: { id: true },
            });

            if (dbItems.length !== itemIds.length) {
                throwError({
                    message: "One or more items are invalid",
                    statusCode: 400,
                });
            }

            // ------------------------
            // Calculate totals
            // ------------------------
            const subtotal = data.items.reduce(
                (sum, i) => sum + Number(i.quantity) * i.unitPrice,
                0
            );

            const grandTotal =
                subtotal -
                (data.discount * subtotal) / 100 +
                data.transportCost;

            const paid = data.payment?.paidAmount ?? 0;
            const due = grandTotal - paid;

            // ------------------------
            // Create purchase
            // ------------------------
            const purchase = await tx.purchase.create({
                data: {
                    supplier: {
                        connect: {
                            id: supplier.id,
                        },
                    },
                    invoice_no: data.invoiceNo,
                    purchase_date: data.purchaseDate,
                    paid_amount: paid,
                    due_amount: due,
                    total_amount: grandTotal,
                },
            });

            // ------------------------
            // Insert purchase items (bulk)
            // ------------------------
            await tx.purchaseItem.createMany({
                data: data.items.map((item) => ({
                    item_id: item.itemId,
                    unit: item.unit,
                    unit_price: item.unitPrice,
                    quantity: item.quantity,
                    total_price: item.unitPrice * Number(item.quantity),
                    purchase_id: purchase.id,
                })),
            });

            // ------------------------
            // Create payment only if needed
            // ------------------------
            if (data.paymentStatus !== PaymentStatus.UNPAID) {
                await tx.payment.create({
                    data: {
                        payment_date: data.payment!.paymentDate,
                        amount: data.payment!.paidAmount,
                        direction: PaymentType.OUTGOING,
                        ref_type: PaymentRefType.PURCHASE,
                        ref_id: purchase.id,
                        from_instrument_id: data.payment!.fromInstrumentId,
                        to_instrument_id: data.payment!.toInstrumentId,
                        handled_by_id: data.payment!.handledById,
                        note: data.payment!.note,
                    },
                });
            }

            // ------------------------
            // Expense only if transport cost > 0
            // ------------------------
            if (data.transportCost > 0) {
                await tx.expense.create({
                    data: {
                        category: ExpenseCategory.TRANSPORT,
                        amount: data.transportCost,
                        date: data.purchaseDate,
                    },
                });
            }

            // ------------------------
            // Stock ledger bulk insert
            // ------------------------
            await tx.stockLedger.createMany({
                data: data.items.map((item) => ({
                    item_id: item.itemId,
                    idempotency_key: `PURCHASE:${purchase.id}:${item.itemId}`,
                    direction: StockDirection.IN,
                    quantity: item.quantity,
                    unit_cost: item.unitPrice,
                    reason: StockReason.PURCHASE,
                    occurred_at: data.purchaseDate,
                    ref_type: RefType.PURCHASE,
                    ref_id: purchase.id,
                    location_type: LocationType.WAREHOUSE,
                    location_id: null,

                })),
            });
        });

        return response({ message: "Purchase created successfully" });
    } catch (error) {
        return errorResponse(error);
    }
}
