import { z } from "zod";
import { decimalNumber } from "./helper";

export const addWeightRecordSchema = z.object({
    houseId: z.string().uuid(),
    occurredAt: z.coerce.date(),
    avgWeightInGrams: decimalNumber,
    sampleSize: z.number().positive("Please provide sample size"),
});

export type AvgWeightFormInput = z.input<typeof addWeightRecordSchema>;
export type AvgWeightFormOutput = z.output<typeof addWeightRecordSchema>;
