import { BirdBreeds } from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber, zodDate, zodUUID } from "./helper";
import { paymentSchema } from "./payment.schem";

// Define the expected shape of the BirdBreeds enum for Zod
// This creates a Zod Enum schema from your imported enum values.
const BirdBreedsSchema = z.enum(Object.values(BirdBreeds));

const houseAllocationSchema = z.object({
    houseId: zodUUID,
    allocationType: z.enum(["PARTIAL", "FULL"]),
    quantity: z
        .number()
        .positive("Quantity must be positive")
        .int("Quantity must be an integer"),
})

// --- Define the Zod Validation Schema ---
export const addBatchSchema = z.object({
    initChicksAvgWT: decimalNumber,
    initialQuantity: z
        .number().int().default(0),
    breed: BirdBreedsSchema.refine(
        (val) => Object.values(BirdBreeds).includes(val),
        {
            message: "Invalid 'breed' field. Must be a recognized bird breed.",
        }
    ),
    date: zodDate,
    feedId: zodUUID,
    supplierId: zodUUID,
    allocation: z.array(houseAllocationSchema).min(
        1,
        "The 'allocation' array cannot be empty. At least one allocation is required."
    ),
    unitPrice: decimalNumber,
    paymentStatus: z.enum(["PAID", "UNPAID", "PARTIAL"]),
    payment: paymentSchema,

}).superRefine((data, ctx) => {

    if (data.paymentStatus === "PAID") {
        if (!data.payment) {
            ctx.addIssue({
                path: ["payment"],
                message: "Payment is required when status is PAID",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    if (data.paymentStatus === "PARTIAL") {
        if (!data.payment || data.payment.paidAmount <= 0) {
            ctx.addIssue({
                path: ["payment", "paidAmount"],
                message:
                    "Paid amount must be greater than 0 for PARTIAL",
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

    if (!data.supplierId && (data.paymentStatus === "UNPAID" || data.paymentStatus === "PARTIAL")) {
        ctx.addIssue({
            path: ["payment", "paymentStatus"],
            message: "Supplier is required if payment is not paid or partial",
            code: z.ZodIssueCode.custom,
        });
    }

    if (!data.supplierId && data.payment?.toInstrumentId) {
        ctx.addIssue({
            path: ["payment", "toInstrumentId"],
            message: "Supplier is required if to select payment instrument",
            code: z.ZodIssueCode.custom,
        });
    }
});


export const batchAllocationSchema = z.object({
    toHouseId: zodUUID,
    fromHouseId: zodUUID,
    date: zodDate,
    allocationType: z.enum(["PARTIAL", "FULL"]),
    quantity: z
        .number()
        .positive("Quantity must be positive")
        .int("Quantity must be an integer"),
})
// .superRefine((data) => {
//     console.log("submitted Data:", data);

// });

// Zod Type Inference (for type safety in the function body)
// type ValidBatchData = z.infer<typeof BatchSchema>;

export type BatchAllocationInput = z.input<typeof batchAllocationSchema>;
export type BatchAllocationOutput = z.output<typeof batchAllocationSchema>;
export type AddBatchInput = z.input<typeof addBatchSchema>;
export type AddBatchOutput = z.output<typeof addBatchSchema>;
