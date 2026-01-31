import { z } from "zod";
import { decimalNumber, zodDate, zodUUID } from "./helper";

export const recordItemUsageSchema = z.object({
    itemId: zodUUID,
    houseId: zodUUID,
    quantity: decimalNumber,
    occurredAt: zodDate,
    note: z.string().optional(),
});

export type RecordItemUsageInput = z.input<typeof recordItemUsageSchema>;
export type RecordItemUsageOutput = z.output<typeof recordItemUsageSchema>;
