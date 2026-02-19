import { AllocationReason, Prisma } from "@/app/generated/prisma/client";
import { PrismaTx } from "@/types/db";

type GetHouseBatchBalancesByLedgerReplayArgs = {
    houseId?: string;
    houseIds?: string[];
    occurredAt?: Date; // optional → defaults to now
};

type GetHouseBatchBalancesFastArgs = {
    houseId?: string;
    houseIds?: string[];
};

export async function getHouseBatchBalancesByLedgerReplay(
    tx: PrismaTx,
    args: GetHouseBatchBalancesByLedgerReplayArgs
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


export async function assertHouseHasRunningBatchByLedgerReplay(
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


export async function assertBatchRunningInHouseByLedgerReplay(
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



export async function getAvailableQuantityByLedgerReplay(
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


export async function getHouseBatchBalancesFast(
    tx: PrismaTx,
    args: GetHouseBatchBalancesFastArgs
) {
    const { houseId, houseIds } = args;

    if (!houseId && (!houseIds || houseIds.length === 0)) {
        throw new Error("houseId or houseIds must be provided");
    }

    // console.log("[HOUSE ID] => ", houseId);
    // console.log("[HOUSE IDS] => ", houseIds);

    return await tx.batchHouseBalance.findMany({
        where: {
            house_id: houseId
                ? houseId
                : { in: houseIds! },
            quantity: { not: 0 },
        },
        select: {
            batch_id: true,
            house_id: true,
            quantity: true,
        },
    });
}

export async function assertHouseHasRunningBatchFast(
    tx: PrismaTx,
    houseId: string
) {
    const result = await tx.batchHouseBalance.findMany({
        where: {
            house_id: houseId,
            quantity: { gt: 0 },
        },
        select: {
            batch_id: true,
            quantity: true,
        },
    });

    // Optional: enforce ONE running batch per house
    if (result.length > 1) {
        throw new Error(
            `Data corruption: house ${houseId} has multiple running batches`
        );
    }

    return result.length > 0 ? {
        batch_id: result[0].batch_id,
        qty: result[0].quantity,
    } : null;
}

export async function assertHouseHasRunningBatchFastThrowError(
    tx: PrismaTx,
    houseId: string
) {
    const result = await tx.batchHouseBalance.findMany({
        where: {
            house_id: houseId,
            quantity: { gt: 0 },
        },
        select: {
            batch_id: true,
            quantity: true,
        },
    });

    console.log("[RESULT] => ", result);

    if (result.length === 0) {
        throw new Error(`House ${houseId} has no running batch`);
    }

    // Optional: enforce ONE running batch per house
    if (result.length > 1) {
        throw new Error(
            `Data corruption: house ${houseId} has multiple running batches`
        );
    }

    return {
        batch_id: result[0].batch_id,
        qty: result[0].quantity,
    };
}

export async function assertBatchRunningInHouseFast(
    tx: PrismaTx,
    args: { houseId: string; batchId: string }
) {
    const { houseId, batchId } = args;
    const row = await tx.batchHouseBalance.findUnique({
        where: {
            batch_id_house_id: {
                batch_id: batchId,
                house_id: houseId,
            },
        },
        select: {
            quantity: true,
        },
    });

    const qty = row?.quantity ?? 0;

    if (qty <= 0) {
        throw new Error(
            `Batch ${batchId} is not running in house ${houseId}`
        );
    }

    return qty;
}

export async function getAvailableQuantityFast(
    tx: PrismaTx,
    args: { houseId: string; batchId: string }
): Promise<number> {
    const { houseId, batchId } = args;
    const row = await tx.batchHouseBalance.findUnique({
        where: {
            batch_id_house_id: {
                batch_id: batchId,
                house_id: houseId,
            },
        },
        select: {
            quantity: true,
        },
    });

    return row?.quantity ?? 0;
}


export async function applyBatchHouseBalanceDelta(
    tx: PrismaTx,
    args: {
        batchId: string;
        houseId: string;
        deltaQty: number; // can be positive or negative
    }
) {
    const { batchId, houseId, deltaQty } = args;

    if (deltaQty === 0) return;

    // Upsert first (ensures row exists)
    const row = await tx.batchHouseBalance.upsert({
        where: {
            batch_id_house_id: {
                batch_id: batchId,
                house_id: houseId,
            },
        },
        create: {
            batch_id: batchId,
            house_id: houseId,
            quantity: deltaQty,
        },
        update: {
            quantity: { increment: deltaQty },
        },
        select: {
            id: true,
            quantity: true,
        },
    });

    // If balance becomes zero (or negative due to corruption), delete it
    if (row.quantity <= 0) {
        await tx.batchHouseBalance.delete({
            where: { id: row.id },
        });

        if (row.quantity < 0) {
            throw new Error(
                `Data corruption: balance became negative for batch=${batchId}, house=${houseId}`
            );
        }
    }
}

export async function createBatchHouseAllocationWithBalanceUpdate(
    tx: PrismaTx,
    args: {
        batchId: string;
        fromHouseId?: string | null;
        toHouseId?: string | null;
        quantity: number; // always positive
        reason: AllocationReason;
        occurredAt?: Date;
    }
) {
    const {
        batchId,
        fromHouseId,
        toHouseId,
        quantity,
        reason,
        occurredAt,
    } = args;

    if (!fromHouseId && !toHouseId) {
        throw new Error("fromHouseId or toHouseId must be provided");
    }

    if (fromHouseId && toHouseId && fromHouseId === toHouseId) {
        throw new Error("fromHouseId and toHouseId cannot be the same");
    }

    if (quantity <= 0) {
        throw new Error("quantity must be greater than 0");
    }

    if (reason === AllocationReason.INITIAL) {
        if (!toHouseId) {
            throw new Error("toHouseId must be provided for INITIAL allocation");
        }
        if (fromHouseId) {
            throw new Error("fromHouseId must not be provided for INITIAL allocation");
        }
    }

    if (reason === AllocationReason.TRANSFER) {
        if (!fromHouseId || !toHouseId) {
            throw new Error("fromHouseId and toHouseId must be provided for TRANSFER allocation");
        }
    }

    // 1) create allocation event (ledger)
    const allocation = await tx.batchHouseAllocation.create({
        data: {
            batch_id: batchId,
            from_house_id: fromHouseId ?? null,
            to_house_id: toHouseId ?? null,
            quantity,
            reason,
            occurred_at: occurredAt ?? new Date(),
        },
    });

    // 2) update balances
    if (fromHouseId) {
        await applyBatchHouseBalanceDelta(tx, {
            batchId,
            houseId: fromHouseId,
            deltaQty: -quantity,
        });
    }

    if (toHouseId) {
        await applyBatchHouseBalanceDelta(tx, {
            batchId,
            houseId: toHouseId,
            deltaQty: +quantity,
        });
    }

    return allocation;
}
