import { Prisma } from "@/app/generated/prisma/client";
import { PrismaTx } from "@/types/db";

type GetActiveAllocationArgs = {
    houseId?: string;
    houseIds?: string[];
    occurredAt: Date;

    select?: {
        allocation?: Prisma.BatchHouseAllocationSelect;
        batch?: Prisma.BatchesSelect;
        house?: Prisma.HousesSelect;
    };
};

export async function getActiveBatchHouseAllocations(
    tx: PrismaTx,
    args: GetActiveAllocationArgs
) {
    const { houseId, houseIds, occurredAt, select } = args;

    if (!houseId && (!houseIds || houseIds.length === 0)) {
        throw new Error("houseId or houseIds must be provided");
    }

    return tx.batchHouseAllocation.findMany({
        where: {
            house_id: houseId ? houseId : { in: houseIds },

            start_date: {
                lte: occurredAt,
            },
            OR: [
                { end_date: null },
                {
                    end_date: {
                        gte: occurredAt,
                    },
                },
            ],
        },

        select: {
            ...(select?.allocation ?? { id: true }),

            batch: select?.batch ? { select: select.batch } : undefined,

            house: select?.house ? { select: select.house } : undefined,
        },
    });
}
