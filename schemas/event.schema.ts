import { z } from "zod";
import { HouseEventEnum, HouseEventUnitEnum } from "@/types/enum";
import { decimalNumber, decimalOptional } from "./helper";

export const addHouseEventSchema = z
    .object({
        houseId: z.string().uuid(),
        eventType: z.nativeEnum(HouseEventEnum),
        occurredAt: z.coerce.date(),
        quantity: decimalNumber,
        leftOverFeedQty: decimalOptional,
        unit: z.nativeEnum(HouseEventUnitEnum),
    })
    .superRefine((data, ctx) => {
        if (
            data.eventType === HouseEventEnum.MORTALITY &&
            data.unit !== HouseEventUnitEnum.BIRD
        ) {
            ctx.addIssue({
                path: ["unit"],
                message: "Mortality events must use BIRD",
                code: z.ZodIssueCode.custom,
            });
        }

        if (
            data.eventType === HouseEventEnum.WATER &&
            data.unit !== HouseEventUnitEnum.LITER
        ) {
            ctx.addIssue({
                path: ["unit"],
                message: "Water events must use LITER",
                code: z.ZodIssueCode.custom,
            });
        }

        if (
            data.eventType === HouseEventEnum.FEED &&
            data.unit !== HouseEventUnitEnum.KG &&
            data.unit !== HouseEventUnitEnum.BAG
        ) {
            ctx.addIssue({
                path: ["unit"],
                message: "Feed events must use KG or BAG",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export type HouseEventFormInput = z.input<typeof addHouseEventSchema>;
export type HouseEventFormOutput = z.output<typeof addHouseEventSchema>;
