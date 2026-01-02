import { PaymentStatus, Units } from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber } from "./helper";

const purchaseItemSchema = z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.nativeEnum(Units),
    unitPrice: decimalNumber, // Decimal(10,2)
});

const paymentSchema = z.object({
    paidAmount: decimalNumber,

    fromInstrumentId: z.string().uuid(),
    toInstrumentId: z.string().uuid(),

    transactionRef: z.string().optional(),
    handledById: z.string().uuid().optional(),
    paymentDate: z.date().optional(),
});

export const purchaseSchema = z
    .object({
        // 1️⃣ Header
        supplierId: z.string().uuid(),
        purchaseDate: z.date(),

        invoiceNo: z.string().optional(),
        note: z.string().optional(),

        // 2️⃣ Items (must exist)
        items: z.array(purchaseItemSchema).min(1),

        // 3️⃣ Summary adjustments
        discount: decimalNumber.optional().default(0),
        transportCost: decimalNumber.optional().default(0),

        // 4️⃣ Payment intent
        paymentStatus: z.nativeEnum(PaymentStatus),

        payment: paymentSchema.optional(),
    })
    .superRefine((data, ctx) => {
        // If PAID or PARTIAL → payment must exist
        if (data.paymentStatus !== "DUE" && !data.payment) {
            ctx.addIssue({
                path: ["payment"],
                message: "Payment details required for PAID or PARTIAL status",
                code: z.ZodIssueCode.custom,
            });
        }

        // If DUE → payment must NOT exist
        if (data.paymentStatus === "DUE" && data.payment) {
            ctx.addIssue({
                path: ["payment"],
                message: "Payment should not be provided when status is DUE",
                code: z.ZodIssueCode.custom,
            });
        }
    });
