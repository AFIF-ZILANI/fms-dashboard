import { BirdBreeds } from "@/app/generated/prisma/enums";
import { z } from "zod";
import { decimalNumber, zodDate, zodUUID } from "./helper";

// Define the expected shape of the BirdBreeds enum for Zod
// This creates a Zod Enum schema from your imported enum values.
const BirdBreedsSchema = z.enum(Object.values(BirdBreeds));
// This schema defines the structure for a single object within the suppliers array.
const supplierSchema = z.object({
    id: z.uuid("Supplier ID must be a valid UUID."), // Assuming IDs are UUIDs

    quantity: z
        .number({
            message: "Supplier quantity must be a number.",
        })
        .int("Supplier quantity must be a whole number.")
        .positive("Supplier quantity must be greater than zero."),

    unitPrice: decimalNumber,
    deliveryDate: zodDate,
});

// --- Define the Zod Validation Schema ---
export const addBatchSchema = z.object({
    // 1. Initial Weight (Number)
    initChicksAvgWT: decimalNumber,
    // 2. Initial Quantity (Integer)
    initialQuantity: z
        .number().int().default(0),

    // 3. Breed (Enum)
    breed: BirdBreedsSchema.refine(
        (val) => Object.values(BirdBreeds).includes(val),
        {
            message: "Invalid 'breed' field. Must be a recognized bird breed.",
        }
    ),
    date: zodDate,
    feedId: zodUUID,
    suppliers: z
        .array(supplierSchema)
        .min(
            1,
            "The 'suppliers' array cannot be empty. At least one supplier is required."
        ),

}).superRefine((data) => {
    // console.log("Batch submitted:", data);
    let initQ = 0;
    data.suppliers.map((sup) => (initQ += sup.quantity));
    data.initialQuantity = initQ;
    // console.log("[data]: ", { ...data, initialQuantity: initQ });
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
