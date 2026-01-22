import { Prisma } from "@/app/generated/prisma/client";
import { ResourceCategories, StockReason } from "@/app/generated/prisma/enums";

import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { parsePositiveInt } from "@/lib/utils";
import {
    InventoryItem,
    VALID_SORT_FIELDS,
    VALID_SORT_ORDERS,
    VALID_STATUSES,
    ValidSortField,
    ValidSortOrder,
    ValidStatus,
} from "@/types/inventory/type";

type StockItem = {
    id: string;
    name: string;
    category: ResourceCategories;
    unit: string;
    stock: number;
    last_movement_at: Date;
    last_movement_qty: number;
    last_movement_type: StockReason;
    stock_state: "INITIALIZED" | "NOT_INITIALIZED";
    reorder_level: number;
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

        const search = (searchParams.get("search") ?? "").trim();
        const category = searchParams.get("category");
        const status = searchParams.get("status");
        const sortBy = searchParams.get("sortBy") ?? "name";
        const sortOrder = searchParams.get("sortOrder") ?? "asc";

        // console.log("[PAGE] => ", page);
        // console.log("[LIMIT] => ", limit);
        // console.log("[SEARCH] => ", search);
        // console.log("[CATEGORY] => ", category);
        // console.log("[STATUS] => ", status);
        // console.log("[SORT BY] => ", sortBy);
        // console.log("[SORT ORDER] => ", sortOrder);

        // ---------------- VALIDATION ----------------

        if (status && status !== "all") {
            if (!VALID_STATUSES.includes(status as ValidStatus)) {
                throwError({
                    message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
                    statusCode: 400,
                });
            }
        }

        if (category && category !== "all") {
            const validCategories = Object.values(ResourceCategories);
            if (!validCategories.includes(category as ResourceCategories)) {
                throwError({
                    message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
                    statusCode: 400,
                });
            }
        }

        if (search.length > 100) {
            throwError({
                message: "Search query too long. Maximum 100 characters.",
                statusCode: 400,
            });
        }

        if (!VALID_SORT_FIELDS.includes(sortBy as ValidSortField)) {
            throwError({
                message: `Invalid sortBy. Must be one of: ${VALID_SORT_FIELDS.join(", ")}`,
                statusCode: 400,
            });
        }

        if (!VALID_SORT_ORDERS.includes(sortOrder as ValidSortOrder)) {
            throwError({
                message: `Invalid sortOrder. Must be one of: ${VALID_SORT_ORDERS.join(", ")}`,
                statusCode: 400,
            });
        }

        // ---------------- QUERY BUILDING ----------------

        const offset = (page - 1) * limit;
        const searchCondition = search
            ? Prisma.sql`AND (
                i.name ILIKE ${`%${search}%`}
                OR i.category::text ILIKE ${`%${search}%`}
            )`
            : Prisma.empty;

        const categoryCondition =
            category && category !== "all"
                ? Prisma.sql`AND i.category = ${category}::"ResourceCategories"`
                : Prisma.empty;

        let stockCondition = Prisma.empty;

        if (status === "OUT") {
            stockCondition = Prisma.sql`
    AND lm.item_id IS NOT NULL
    AND COALESCE(s.stock, 0) = 0
  `;
        } else if (status === "LOW") {
            stockCondition = Prisma.sql`
    AND lm.item_id IS NOT NULL
    AND COALESCE(s.stock, 0) > 0
    AND COALESCE(s.stock, 0) < i.reorder_level
  `;
        } else if (status === "OK") {
            stockCondition = Prisma.sql`
    AND lm.item_id IS NOT NULL
    AND COALESCE(s.stock, 0) >= i.reorder_level
  `;
        } else if (status === "NOT_INITIALIZED") {
            stockCondition = Prisma.sql`
    AND lm.item_id IS NULL
  `;
        }

        let orderByClause = Prisma.empty;

        if (sortBy === "name") {
            orderByClause =
                sortOrder === "asc"
                    ? Prisma.sql`ORDER BY i.name ASC`
                    : Prisma.sql`ORDER BY i.name DESC`;
        } else if (sortBy === "stock") {
            orderByClause =
                sortOrder === "asc"
                    ? Prisma.sql`ORDER BY s.stock ASC NULLS LAST`
                    : Prisma.sql`ORDER BY s.stock DESC NULLS LAST`;
        } else if (sortBy === "lastUpdated") {
            orderByClause =
                sortOrder === "asc"
                    ? Prisma.sql`ORDER BY lm.occurred_at ASC NULLS LAST`
                    : Prisma.sql`ORDER BY lm.occurred_at DESC NULLS LAST`;
        }

        // console.log("[OFFSET] => ", offset);
        // console.log("[SEARCH CONDITION] => ", searchCondition);
        // console.log("[CATEGORY CONDITION] => ", categoryCondition);
        // console.log("[STOCK CONDITION] => ", stockCondition);
        // console.log("[ORDER BY CLAUSE] => ", orderByClause);
        // ---------------- MAIN QUERY ----------------

        const items = await prisma.$queryRaw<StockItem[]>`
  WITH stock_summary AS (
    SELECT 
      item_id,
      SUM(quantity)::float AS stock
    FROM "StockLedger"
    GROUP BY item_id
  ),
  latest_movement AS (
    SELECT *
    FROM (
      SELECT 
        sl.*,
        ROW_NUMBER() OVER (PARTITION BY sl.item_id ORDER BY sl.occurred_at DESC) AS rn
      FROM "StockLedger" sl
    ) t
    WHERE t.rn = 1
  )
  SELECT 
    i.id,
    i.name,
    i.category,
    i.reorder_level,
    i.unit,
    COALESCE(s.stock, 0) AS stock,
    lm.quantity AS last_movement_qty,
    lm.occurred_at AS last_movement_at,
    lm.reason AS last_movement_type,
    CASE 
      WHEN lm.item_id IS NULL THEN 'NOT_INITIALIZED'
      ELSE 'INITIALIZED'
    END AS stock_state
  FROM "Item" i
  LEFT JOIN stock_summary s ON s.item_id = i.id
  LEFT JOIN latest_movement lm ON lm.item_id = i.id
  WHERE 1=1
    ${searchCondition}
    ${categoryCondition}
    ${stockCondition}
  ${orderByClause || Prisma.empty}
  LIMIT ${limit}
  OFFSET ${offset};
`;

        const countResult = await prisma.$queryRaw<{ total: number }[]>`
  WITH stock_summary AS (
    SELECT 
      item_id,
      SUM(quantity)::float AS stock
    FROM "StockLedger"
    GROUP BY item_id
  ),
  latest_movement AS (
    SELECT *
    FROM (
      SELECT 
        sl.*,
        ROW_NUMBER() OVER (PARTITION BY sl.item_id ORDER BY sl.occurred_at DESC) AS rn
      FROM "StockLedger" sl
    ) t
    WHERE t.rn = 1
  )
  SELECT COUNT(*)::int AS total
  FROM "Item" i
  LEFT JOIN stock_summary s ON s.item_id = i.id
  LEFT JOIN latest_movement lm ON lm.item_id = i.id
  WHERE 1=1
    ${searchCondition}
    ${categoryCondition}
    ${stockCondition}
`;

        const formatedItems: InventoryItem[] = items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            unit: i.unit,
            stock: i.stock,
            lastMovement: i.last_movement_at,
            movementQuantity: i.last_movement_qty,
            movementType: i.last_movement_type,
            status:
                i.stock_state === "NOT_INITIALIZED"
                    ? "NOT_INITIALIZED"
                    : i.stock === 0
                      ? "OUT"
                      : i.stock > 0 && i.stock < i.reorder_level
                        ? "LOW"
                        : "OK",
        }));
        const total = countResult[0]?.total ?? 0;

        // console.log("[ITEMS] => ", items);
        // console.log("[COUNT RESULT] => ", countResult);
        // console.log("[TOTAL] => ", total);
        // console.log("[FORMATED ITEMS] => ", formatedItems);
        return response({
            message: "Stock items retrieved successfully",
            data: {
                items: formatedItems,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Stock API error:", error);
        return errorResponse(error);
    }
}
