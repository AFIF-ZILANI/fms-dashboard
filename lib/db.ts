import { Prisma } from "@/app/generated/prisma/client";
import { PrismaTx } from "@/types/db";

type GetHouseBatchBalancesArgs = {
    houseId?: string;
    houseIds?: string[];
    occurredAt?: Date; // optional → defaults to now
};

export async function getHouseBatchBalances(
    tx: PrismaTx,
    args: GetHouseBatchBalancesArgs
) {
    const { houseId, houseIds, occurredAt } = args;

    if (!houseId && (!houseIds || houseIds.length === 0)) {
        throw new Error("houseId or houseIds must be provided");
    }

    const dateFilter = occurredAt
        ? Prisma.sql`AND occurred_at <= ${occurredAt}`
        : Prisma.empty;

    return tx.$queryRaw<
        {
            batch_id: string;
            house_id: string;
            quantity: number;
        }[]
    >(Prisma.sql`
        SELECT
            bha.batch_id,
            h.house_id,
            SUM(h.qty)::int AS quantity
        FROM (
            SELECT
                batch_id,
                to_house_id AS house_id,
                quantity AS qty,
                occurred_at
            FROM "BatchHouseAllocation"
            WHERE to_house_id IS NOT NULL

            UNION ALL

            SELECT
                batch_id,
                from_house_id AS house_id,
                -quantity AS qty,
                occurred_at
            FROM "BatchHouseAllocation"
            WHERE from_house_id IS NOT NULL
        ) h
        JOIN "BatchHouseAllocation" bha
          ON bha.batch_id = h.batch_id
        WHERE
            h.house_id ${houseId
            ? Prisma.sql`= ${houseId}`
            : Prisma.sql`IN (${Prisma.join(houseIds!)})`
        }
            ${dateFilter}
        GROUP BY bha.batch_id, h.house_id
        HAVING SUM(h.qty) != 0
    `);
}


export async function assertHouseHasRunningBatch(
    tx: PrismaTx,
    houseId: string,
    at: Date = new Date()
) {
    const result = await tx.$queryRaw<
        { batch_id: string; qty: number }[]
    >(Prisma.sql`
        SELECT
            batch_id,
            SUM(qty)::int AS qty
        FROM (
            SELECT
                batch_id,
                quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE to_house_id = ${houseId}
              AND occurred_at <= ${at}

            UNION ALL

            SELECT
                batch_id,
                -quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE from_house_id = ${houseId}
              AND occurred_at <= ${at}
        ) t
        GROUP BY batch_id
        HAVING SUM(qty) > 0
    `);

    if (result.length === 0) {
        throw new Error(
            `House ${houseId} has no running batch at ${at.toISOString()}`
        );
    }

    // Optional: enforce ONE running batch per house
    if (result.length > 1) {
        throw new Error(
            `Data corruption: house ${houseId} has multiple running batches`
        );
    }

    return result[0]; // { batch_id, qty }
}


export async function assertBatchRunningInHouse(
    tx: PrismaTx,
    batchId: string,
    houseId: string,
    at: Date = new Date()
) {
    const result = await tx.$queryRaw<
        { qty: number }[]
    >(Prisma.sql`
        SELECT COALESCE(SUM(qty), 0)::int AS qty
        FROM (
            SELECT quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE batch_id = ${batchId}
              AND to_house_id = ${houseId}
              AND occurred_at <= ${at}

            UNION ALL

            SELECT -quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE batch_id = ${batchId}
              AND from_house_id = ${houseId}
              AND occurred_at <= ${at}
        ) t
    `);

    if ((result[0]?.qty ?? 0) <= 0) {
        throw new Error(
            `Batch ${batchId} is not running in house ${houseId}`
        );
    }

    return result[0].qty;
}



export async function getAvailableQuantity(
    tx: PrismaTx,
    batchId: string,
    houseId: string,
    occurredAt?: Date
): Promise<number> {
    const dateFilter = occurredAt
        ? Prisma.sql`AND occurred_at <= ${occurredAt}`
        : Prisma.empty;

    const result = await tx.$queryRaw<
        { qty: number }[]
    >(Prisma.sql`
        SELECT COALESCE(SUM(qty), 0)::int AS qty
        FROM (
            SELECT quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE batch_id = ${batchId}
              AND to_house_id = ${houseId}

            UNION ALL

            SELECT -quantity AS qty
            FROM "BatchHouseAllocation"
            WHERE batch_id = ${batchId}
              AND from_house_id = ${houseId}
        ) t
        WHERE 1=1
        ${dateFilter}
    `);

    return result[0]?.qty ?? 0;
}


export async function assertHouseIdsValid(
    tx: PrismaTx,
    houseIds: string[]
) {
    if (!Array.isArray(houseIds) || houseIds.length === 0) {
        throw new Error("houseIds must be a non-empty array");
    }

    const uniqueIds = [...new Set(houseIds)];

    if (uniqueIds.some(id => typeof id !== "string" || !id.trim())) {
        throw new Error("houseIds contains invalid id values");
    }

    if (uniqueIds.length !== houseIds.length) {
        throw new Error("houseIds contains duplicate values");
    }

    const houses = await tx.houses.findMany({
        where: {
            id: { in: uniqueIds },
        },
        select: { id: true },
    });

    if (houses.length !== uniqueIds.length) {
        const found = new Set(houses.map(h => h.id));
        const missing = uniqueIds.filter(id => !found.has(id));

        throw new Error(
            `Invalid houseIds: ${missing.join(", ")}`
        );
    }

    return uniqueIds; // normalized & verified
}

export async function assertBatchIdsValid(
    tx: PrismaTx,
    batchIds: string[]
) {
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
        throw new Error("batchIds must be a non-empty array");
    }

    const uniqueIds = [...new Set(batchIds)];

    if (uniqueIds.some(id => typeof id !== "string" || !id.trim())) {
        throw new Error("batchIds contains invalid id values");
    }

    if (uniqueIds.length !== batchIds.length) {
        throw new Error("batchIds contains duplicate values");
    }

    const batches = await tx.batches.findMany({
        where: {
            id: { in: uniqueIds },
        },
        select: { id: true },
    });

    if (batches.length !== uniqueIds.length) {
        const found = new Set(batches.map(h => h.id));
        const missing = uniqueIds.filter(id => !found.has(id));

        throw new Error(
            `Invalid batchIds: ${missing.join(", ")}`
        );
    }

    return uniqueIds;
}
