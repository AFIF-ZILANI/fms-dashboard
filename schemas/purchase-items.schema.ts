import { PaymentStatus, Units } from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber, decimalOptional } from "./helper";
import { paymentSchema } from "./payment.schem";

export const itemSchema = z.object({
    itemId: z.string().uuid(),
    quantity: decimalNumber, // Decimal(10,2)
    unit: z.nativeEnum(Units),
    unitPrice: decimalNumber, // Decimal(10,2)
});

export const purchaseItemSchema = z
    .object({
        // 1️⃣ Header
        supplierId: z.string().uuid(),
        purchaseDate: z.coerce.date(),

        invoiceNo: z.string().optional(),
        note: z.string().optional(),

        // 2️⃣ Items (must exist)
        items: z.array(itemSchema).min(1),

        // 3️⃣ Summary adjustments
        discount: decimalOptional.default(0),
        transportCost: decimalOptional.default(0),

        // 4️⃣ Payment intent
        paymentStatus: z.nativeEnum(PaymentStatus),

        payment: paymentSchema.optional(),
    })
    .superRefine((data, ctx) => {
        const subtotal = data.items.reduce<number>(
            (s, r) => s + (Number(r.quantity) ?? 0) * (r.unitPrice as number),
            0
        );
        const grandTotal =
            subtotal - (data.discount * subtotal) / 100 + data.transportCost;

        const paid = data.payment?.paidAmount ?? 0;

        if (data.paymentStatus === "PAID") {
            if (!data.payment) {
                ctx.addIssue({
                    path: ["payment"],
                    message: "Payment is required when status is PAID",
                    code: z.ZodIssueCode.custom,
                });
            } else if (paid !== grandTotal) {
                ctx.addIssue({
                    path: ["payment", "paidAmount"],
                    message:
                        "Paid amount must equal grand total when status is PAID",
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        if (data.paymentStatus === "PARTIAL") {
            if (!data.payment || paid <= 0 || paid >= grandTotal) {
                ctx.addIssue({
                    path: ["payment", "paidAmount"],
                    message:
                        "Paid amount must be greater than 0 and less than total for PARTIAL",
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        if (data.paymentStatus === "UNPAID" && data.payment) {
            ctx.addIssue({
                path: ["payment"],
                message: "Payment must not exist when status is UNPAID",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export type PurchaseItemFormInput = z.input<typeof purchaseItemSchema>;
export type PurchaseItemFormOutput = z.output<typeof purchaseItemSchema>;
export type PurchaseItemInput = z.input<typeof itemSchema>;
export type PurchaseItemOutput = z.output<typeof itemSchema>;
