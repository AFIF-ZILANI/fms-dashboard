import { PrismaClient } from "@/app/generated/prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/client";

export type PrismaTx = Omit<
    PrismaClient<never, undefined, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
