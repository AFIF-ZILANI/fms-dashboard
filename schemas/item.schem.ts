import {
    ConsumptionPurpose,
    RefType,
    ResourceCategories,
    StockDirection,
    StockReason,
    Units,
} from "@/app/generated/prisma/enums";
import { z } from "zod";
const decimalNumber = z.preprocess(
    (val) => {
        if (typeof val === "string") {
            const parsed = Number(val);
            return Number.isFinite(parsed) ? parsed : undefined;
        }
        return val;
    },
    z
        .number({ error: "Value is required" })
        .positive("Must be greater than 0")
        .refine(
            (v) => Number(v.toFixed(2)) === v,
            "Maximum 2 decimal places allowed"
        )
);

export const addStockItemSchema = z.object({
    name: z.string().min(1),
    category: z.nativeEnum(ResourceCategories),
    unit: z.nativeEnum(Units),

    isMetaDataAvailable: z.boolean(),

    metaData: z.record(z.string(), z.any()).optional(), // medicine/feed/litter future-proof
});

export const addStockLedgerSchema = z.object({
    itemId: z.string().uuid(),
    direction: z.nativeEnum(StockDirection),
    quantity: decimalNumber,

    unitCost: decimalNumber.optional(),

    reason: z.nativeEnum(StockReason),

    occurredAt: z.date().optional(),

    refType: z.nativeEnum(RefType).optional(),
    refId: z.string().uuid().optional(),
});

export const addConsumptionSchema = z.object({
    batchId: z.string().uuid(),
    houseId: z.string().uuid(),
    itemId: z.string().uuid(),

    quantity: decimalNumber,

    purpose: z.nativeEnum(ConsumptionPurpose),

    occurredAt: z.date().optional(),
});

export type AddStockItemSchema = z.infer<typeof addStockItemSchema>;
export type AddStockLedger = z.infer<typeof addStockLedgerSchema>;
export type AddConsumptionSchema = z.infer<typeof addConsumptionSchema>;
