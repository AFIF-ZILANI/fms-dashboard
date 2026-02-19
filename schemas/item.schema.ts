import {
    RefType,
    ResourceCategories,
    StockReason,
    Units,
} from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber, decimalOptional, zodUUID, zodUUIDOptional } from "./helper";
import { MedicineCategory, MedicineForm, MedicineRoute, StorageCondition } from "@/types/enum";


export const addStockItemSchema = z.object({
    name: z.string().min(1),
    category: z.nativeEnum(ResourceCategories, {
        error: "Category is required",
    }),
    unit: z.nativeEnum(Units, {
        error: "Unit is required",
    }),
    isMetaDataAvailable: z.boolean(),
    manufacturerId: zodUUIDOptional,
    importerId: zodUUIDOptional,
    marketerId: zodUUIDOptional,
    distributorId: zodUUIDOptional,
    reorderLevel: decimalOptional,
    metaData: z.record(z.string(), z.string()).optional(), // medicine/feed/litter future-proof
})

export type AddStockItemSchema = z.input<typeof addStockItemSchema>;

export const addStockLedgerSchema = z.object({
    itemId: zodUUID,
    quantity: decimalNumber,
    unitCost: decimalOptional,
    reason: z.nativeEnum(StockReason, {
        error: "Reason is required",
    }),
    occurredAt: z.date().optional(),
    refType: z.nativeEnum(RefType).optional(),
    refId: zodUUIDOptional,
});

export type AddStockLedger = z.infer<typeof addStockLedgerSchema>;

export const addConsumptionSchema = z.object({
    batchId: zodUUID,
    houseId: zodUUID,
    itemId: zodUUID,
    quantity: decimalNumber,
    occurredAt: z.coerce.date().optional(),
});

export type AddConsumptionSchema = z.infer<typeof addConsumptionSchema>;

export const addInitialItemSchema = z.object({
    itemId: zodUUID,
    quantity: decimalNumber,
    unitCost: decimalOptional,
    date: z.coerce.date(),
});

export type AddInitialItemInput = z.input<typeof addInitialItemSchema>;
export type AddInitialItemOutput = z.output<typeof addInitialItemSchema>;

export const addMedicineSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    unit: z.nativeEnum(Units, {
        error: "Unit is required",
    }),
    reorderLevel: decimalOptional,
    category: z.nativeEnum(MedicineCategory, {
        error: "Category is required",
    }),
    manufacturerId: zodUUID,
    importerId: zodUUIDOptional,
    marketerId: zodUUIDOptional,
    distributorId: zodUUIDOptional,
    form: z.nativeEnum(MedicineForm, {
        error: "Form is required",
    }),
    route: z.nativeEnum(MedicineRoute, {
        error: "Route is required",
    }),
    withdrawalDays: z.number().min(0).max(365).optional(),
    storageTempInCelsius: z.number().min(-30).max(50).optional(),
    storageCondition: z
        .nativeEnum(StorageCondition)
        .default(StorageCondition.ROOM),
})
    .superRefine((data, ctx) => {

        // Company or manufacturer required
        if (!data.manufacturerId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Manufacturer is required",
                path: ["manufacturer"],
            });
        }

        // Invalid combinations
        if (data.form === MedicineForm.TABLET && data.route === MedicineRoute.INJECTION) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Tablet cannot be injected",
                path: ["route"],
            });
        }

        // Vaccine storage rule
        if (data.category === MedicineCategory.VACCINE && data.storageCondition === StorageCondition.ROOM) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Vaccines should not be stored at room temperature",
                path: ["storageCondition"],
            });
        }
    });

export type AddMedicineInput = z.input<typeof addMedicineSchema>;
export type AddMedicineOutput = z.output<typeof addMedicineSchema>;

export const addStockReservationSchema = z.object({
    houseId: zodUUID,
    itemId: zodUUID,
    quantity: decimalNumber,
    occurredAt: z.coerce.date().optional(),
    note: z.string().optional(),
})

export type AddStockReservationInput = z.input<typeof addStockReservationSchema>;
export type AddStockReservationOutput = z.output<typeof addStockReservationSchema>;
