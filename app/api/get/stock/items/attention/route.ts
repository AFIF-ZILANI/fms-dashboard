import { StockReason } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { AttentionItem } from "@/types/inventory/type";

type Item = {
    id: string;
    name: string;
    unit: string;
    stock: number;
    reorder_level: number;
    stock_state: "INITIALIZED" | "NOT_INITIALIZED";
    last_purchase_at: Date | null;
    last_purchase_type: "PURCHASE" | "OPENING_BALANCE" | null;
};

export async function GET() {
    try {
        const items = await prisma.$queryRaw<Item[]>`
  WITH stock_summary AS (
    SELECT 
      item_id,
      SUM(quantity)::float AS stock
    FROM "StockLedger"
    GROUP BY item_id
  ),
  latest_purchase AS (
    SELECT *
    FROM (
      SELECT 
        sl.item_id,
        sl.occurred_at,
        sl.reason,
        ROW_NUMBER() OVER (
          PARTITION BY sl.item_id 
          ORDER BY sl.occurred_at DESC
        ) AS rn
      FROM "StockLedger" sl
      WHERE sl.reason IN (${StockReason.PURCHASE}, ${StockReason.OPENING_BALANCE})
    ) t
    WHERE t.rn = 1
  )
  SELECT 
    i.id,
    i.name,
    i.unit,
    i.reorder_level,
    COALESCE(s.stock, 0) AS stock,

    lp.occurred_at AS last_purchase_at,
    lp.reason AS last_purchase_type,

    CASE 
      WHEN lp.item_id IS NULL THEN 'NOT_INITIALIZED'
      ELSE 'INITIALIZED'
    END AS stock_state

  FROM "Item" i
  LEFT JOIN stock_summary s ON s.item_id = i.id
  LEFT JOIN latest_purchase lp ON lp.item_id = i.id
  WHERE 
    COALESCE(s.stock, 0) >= 0
    AND (
      COALESCE(s.stock, 0) < i.reorder_level
      OR lp.item_id IS NULL
    )
`;

        console.log("[ATTENTION ITEMS]", items);

        const filteredItems: AttentionItem[] = items.map((i) => ({
            id: i.id,
            name: i.name,
            unit: i.unit,
            stock: i.stock,
            lastPurchased: i.last_purchase_at,
            status:
                i.stock_state === "NOT_INITIALIZED"
                    ? "NOT_INITIALIZED"
                    : i.stock === 0
                      ? "OUT"
                      : "LOW",
            reorderLevel: i.reorder_level,
            purchaseType: i.last_purchase_type,
        }));

        return response({
            message: "successfully fetched critical items",
            data: {
                items: filteredItems,
            },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
