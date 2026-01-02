import { z } from "zod";

export const decimalNumber = z.preprocess(
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
