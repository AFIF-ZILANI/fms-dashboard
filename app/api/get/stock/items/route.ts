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

  warehouse_stock: number;
  house_reserved_stock: number;

  last_movement_at: Date | null;
  last_movement_qty: number | null;
  last_movement_type: StockReason | null;

  stock_state: "INITIALIZED" | "NOT_INITIALIZED";
  reorder_level: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

    const search = (searchParams.get("search") ?? "").trim();
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim();
    const sortBy = searchParams.get("sortBy")?.trim() ?? "name";
    const sortOrder = searchParams.get("sortOrder")?.trim() ?? "asc";

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

    let items: StockItem[] = [];
    let countResult: { total: number }[] = [];

    await prisma.$transaction(async (tx) => {

      items = await tx.$queryRaw<StockItem[]>` 
WITH warehouse_stock AS (
  SELECT 
    item_id,
    SUM(
      CASE 
        WHEN direction = 'IN'  THEN quantity
        WHEN direction = 'OUT' THEN -quantity
        ELSE 0
      END
    ) AS warehouse_stock
  FROM "StockLedger"
  WHERE location_type = 'WAREHOUSE'
  GROUP BY item_id
),

house_reservation AS (
  SELECT 
    item_id,
    SUM(quantity) AS total_reserved
  FROM "StockReservation"
  GROUP BY item_id
),

house_consumption AS (
  SELECT
    item_id,
    SUM(quantity) AS total_consumed
  FROM "StockLedger"
  WHERE location_type = 'HOUSE'
    AND direction = 'OUT'
    AND reason = 'CONSUMPTION'
  GROUP BY item_id
),

house_reserved_alive AS (
  SELECT
    hr.item_id,
    COALESCE(hr.total_reserved, 0)
    - COALESCE(hc.total_consumed, 0)
    AS house_reserved_stock
  FROM house_reservation hr
  LEFT JOIN house_consumption hc 
    ON hc.item_id = hr.item_id
),

item_initialized AS (
  SELECT DISTINCT item_id
  FROM "StockLedger"
),

latest_movement AS (
  SELECT *
  FROM (
    SELECT
      sl.item_id,
      sl.ref_type,
      sl.ref_id,

     SUM(
  CASE
    WHEN sl.ref_type IN ('STOCK_RESERVATION')
         AND sl.direction = 'OUT'
      THEN sl.quantity

    WHEN sl.ref_type NOT IN ('STOCK_RESERVATION')
         AND sl.direction = 'IN'
      THEN sl.quantity

    WHEN sl.ref_type NOT IN ('STOCK_RESERVATION')
         AND sl.direction = 'OUT'
      THEN -sl.quantity
  END
) AS total_quantity,
      MAX(sl.occurred_at) AS occurred_at,
      MAX(sl.reason) AS reason,

      ROW_NUMBER() OVER (
        PARTITION BY sl.item_id
        ORDER BY MAX(sl.occurred_at) DESC
      ) AS rn

    FROM "StockLedger" sl
    WHERE sl.ref_id IS NOT NULL
    GROUP BY sl.item_id, sl.ref_type, sl.ref_id
  ) t
  WHERE t.rn = 1
)

SELECT 
  i.id,
  i.name,
  i.category,
  i.unit,
  i.reorder_level,

  COALESCE(ws.warehouse_stock, 0) AS warehouse_stock,
  COALESCE(hra.house_reserved_stock, 0) AS house_reserved_stock,

  lm.total_quantity AS last_movement_qty,
  lm.occurred_at  AS last_movement_at,
  lm.reason       AS last_movement_type,

  CASE
    WHEN ii.item_id IS NULL THEN 'NOT_INITIALIZED'
    ELSE 'INITIALIZED'
  END AS stock_state

FROM "Item" i
LEFT JOIN warehouse_stock ws 
  ON ws.item_id = i.id
LEFT JOIN house_reserved_alive hra 
  ON hra.item_id = i.id
LEFT JOIN item_initialized ii
  ON ii.item_id = i.id
LEFT JOIN latest_movement lm 
  ON lm.item_id = i.id

WHERE 1=1
  ${searchCondition}
  ${categoryCondition}
  ${stockCondition}
${orderByClause || Prisma.empty}
LIMIT ${limit}
OFFSET ${offset};
`;

      countResult = await tx.$queryRaw<{ total: number }[]>`
  WITH stock_summary AS (
  SELECT 
    item_id,
    SUM(
      CASE 
        WHEN direction='IN' THEN quantity
        WHEN direction='OUT' THEN -quantity
        ELSE 0
      END
    ) AS stock
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
      // const itemIds = items.map((i) => i.id);
      // const reservations = await getItemsAliveReservation(tx, { itemIds })
      // console.log("[RESERVATIONS] => ", reservations);

    })

    const formatedItems: InventoryItem[] = items.map((i) => {
      const warehouseStock = Number(i.warehouse_stock ?? 0);

      const status =
        i.stock_state === "NOT_INITIALIZED"
          ? "NOT_INITIALIZED"
          : warehouseStock === 0
            ? "OUT"
            : warehouseStock < i.reorder_level
              ? "LOW"
              : "OK";

      return {
        id: i.id,
        name: i.name,
        category: i.category,
        unit: i.unit,
        warehouseStock,
        houseReservedStock: Number(i.house_reserved_stock ?? 0),
        lastMovement: i.last_movement_at,
        movementQuantity: i.last_movement_qty,
        movementType: i.last_movement_type,
        status,
      };
    });
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
    return errorResponse(error);
  }
}
