import { SupplierRoleNames, SupplierSupplyCategories } from "@/app/generated/prisma/enums";
import { z } from "zod";

/**
 * Main Create Supplier Schema
 */
export const createSupplierSchema = z.object({
    // ===== Profile fields =====
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100),

    mobile: z
        .string()
        .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),

    email: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")), // allow empty string from form

    address: z
        .string()
        .max(255)
        .optional()
        .or(z.literal("")),

    // ===== Supplier fields =====
    role: z.nativeEnum(SupplierRoleNames),

    type: z
        .array(z.nativeEnum(SupplierSupplyCategories))
        .min(1, "Select at least one supply category"),

    company: z.string().optional().or(z.literal("")),

    // ===== Avatar (from FormData) =====
    avatar: z
        .any()
        .optional()
        .refine(
            (file) => {
                // console.log(file)
                return !file ||
                    (typeof File !== "undefined" &&
                        file instanceof File &&
                        file.size > 0),
                    "Invalid avatar file"
            }
        ),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
