import { z } from "zod";
import { HouseEventEnum, HouseEventUnitEnum } from "@/types/enum";
import { decimalNumber, decimalOptionalZero } from "./helper";

const FEED_BAG_SIZE = 50;

export const addHouseEventSchema = z
    .object({
        houseId: z.string().uuid(),
        eventType: z.nativeEnum(HouseEventEnum),
        occurredAt: z.coerce.date(),
        quantity: decimalNumber,
        leftOverFeedQty: decimalOptionalZero,
        usedLeftOverFeed: z.boolean(),
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

        if (data.eventType === HouseEventEnum.FEED && data.unit === HouseEventUnitEnum.BAG) {
            data.quantity = data.quantity * FEED_BAG_SIZE;
            data.unit = HouseEventUnitEnum.KG;
        }


    });

export type HouseEventFormInput = z.input<typeof addHouseEventSchema>;
export type HouseEventFormOutput = z.output<typeof addHouseEventSchema>;
