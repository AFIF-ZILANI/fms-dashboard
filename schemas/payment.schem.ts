import {
    InstrumentOwner,
    MfsType,
    PaymentMethod,
} from "@/app/generated/prisma/enums";
import { z } from "zod";

export const paymentInstrumentSchema = z
    .object({
        ownerType: z.nativeEnum(InstrumentOwner),

        ownerId: z
            .string()
            .uuid("Invalid owner selected. Please choose a valid person."),

        type: z.nativeEnum(PaymentMethod),

        label: z
            .string()
            .min(1, "Label is required (e.g. Main Bank, Personal bKash)."),

        bankName: z.string().optional(),
        accountNo: z.string().optional(),
        mobileNo: z.string().optional(),
        mfsType: z.nativeEnum(MfsType).optional(),
    })
    .superRefine((data, ctx) => {
        // ownerType
        if (!data.ownerType) {
            ctx.addIssue({
                path: ["ownerType"],
                message: "Please select who owns this payment method.",
                code: z.ZodIssueCode.custom,
            });
        }

        // payment type
        if (!data.type) {
            ctx.addIssue({
                path: ["type"],
                message: "Please select a payment method type.",
                code: z.ZodIssueCode.custom,
            });
        }

        // BANK rules
        if (data.type === PaymentMethod.BANK_TRANSFER) {
            if (!data.bankName?.trim()) {
                ctx.addIssue({
                    path: ["bankName"],
                    message: "Bank name is required for bank accounts.",
                    code: z.ZodIssueCode.custom,
                });
            }

            if (!data.accountNo?.trim()) {
                ctx.addIssue({
                    path: ["accountNo"],
                    message: "Account number is required for bank accounts.",
                    code: z.ZodIssueCode.custom,
                });
            }

            if (!data.bankName?.trim()) {
                ctx.addIssue({
                    path: ["bankName"],
                    message: "Bank Name is required for bank accounts.",
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        // MFS rules
        if (data.type === PaymentMethod.MFS) {
            if (!data.mfsType) {
                ctx.addIssue({
                    path: ["mfsType"],
                    message:
                        "Please select a mobile financial service (bKash, Nagad, etc).",
                    code: z.ZodIssueCode.custom,
                });
            }
            if (!data.mobileNo?.trim()) {
                ctx.addIssue({
                    path: ["mobileNo"],
                    message: `Mobile number is required for ${data.mfsType?.toLowerCase()}`,
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });
