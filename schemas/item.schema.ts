import {
    ConsumptionPurpose,
    RefType,
    ResourceCategories,
    StockReason,
    Units,
} from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber, decimalOptional } from "./helper";

export const addStockItemSchema = z.object({
    name: z.string().min(1),
    category: z.nativeEnum(ResourceCategories),
    unit: z.nativeEnum(Units),

    isMetaDataAvailable: z.boolean(),

    metaData: z.record(z.string(), z.string()).optional(), // medicine/feed/litter future-proof
});

export const addStockLedgerSchema = z.object({
    itemId: z.string().uuid(),
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

export const addInitialItemSchema = z.object({
    itemId: z.string().uuid(),
    quantity: decimalNumber,
    unitCost: decimalOptional,
});

export type AddStockItemSchema = z.infer<typeof addStockItemSchema>;
export type AddStockLedger = z.infer<typeof addStockLedgerSchema>;
export type AddConsumptionSchema = z.infer<typeof addConsumptionSchema>;

export type AddInitialItem = z.infer<typeof addInitialItemSchema>;