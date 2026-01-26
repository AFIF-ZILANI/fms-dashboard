import { StockReason } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { AttentionItem } from "@/types/inventory/type";

type Item = {
    id: string;
    name: string;
    unit: string;
    stock: string; // decimal comes as string
    reorder_level: string;
    stock_state: "INITIALIZED" | "NOT_INITIALIZED";
    last_purchase_at: Date | null;
    last_purchase_type: "PURCHASE" | "OPENING_BALANCE" | null;
    avg_daily_usage: string | null;
    days_left: string | null;
};

export async function GET() {
    try {
        const items = await prisma.$queryRaw<Item[]>`
WITH stock_summary AS (
  SELECT 
    item_id,
    SUM(
      CASE 
        WHEN direction = 'IN' THEN quantity
        WHEN direction = 'OUT' THEN -quantity
        ELSE 0
      END
    ) AS stock
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
),

usage_30d AS (
  SELECT
    item_id,
    SUM(quantity) AS total_out,
    COUNT(DISTINCT DATE(occurred_at)) AS active_days
  FROM "StockLedger"
  WHERE 
    direction = 'OUT'
    AND occurred_at >= NOW() - INTERVAL '30 days'
  GROUP BY item_id
),

usage_stats AS (
  SELECT
    item_id,
    total_out,
    active_days,
    (total_out / NULLIF(active_days, 0)) AS avg_daily_usage
  FROM usage_30d
),

prediction AS (
  SELECT
    u.item_id,
    u.avg_daily_usage,
    s.stock,
    (s.stock / NULLIF(u.avg_daily_usage, 0)) AS days_left,
    u.active_days
  FROM usage_stats u
  JOIN stock_summary s ON s.item_id = u.item_id
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
  END AS stock_state,

  p.avg_daily_usage,
  p.days_left

FROM "Item" i
LEFT JOIN stock_summary s ON s.item_id = i.id
LEFT JOIN latest_purchase lp ON lp.item_id = i.id
LEFT JOIN prediction p ON p.item_id = i.id

WHERE 
  COALESCE(s.stock, 0) >= 0

  -- basic needs attention
  AND (
    COALESCE(s.stock, 0) < i.reorder_level
    OR lp.item_id IS NULL
    OR (
      p.avg_daily_usage IS NOT NULL
      AND p.active_days >= 7
      AND p.avg_daily_usage > 0
      AND p.days_left <= 7
    )
  );
`;

        const mapped: AttentionItem[] = items.map((i) => {
            const stock = Number(i.stock);
            const avg = i.avg_daily_usage ? Number(i.avg_daily_usage) : null;
            const daysLeft = i.days_left ? Number(i.days_left) : null;

            let status: "NOT_INITIALIZED" | "OUT" | "LOW";
            if (i.stock_state === "NOT_INITIALIZED") status = "NOT_INITIALIZED";
            else if (stock === 0) status = "OUT";
            else status = "LOW";

            let suggestionMessage: string | null = null;

            if (avg && daysLeft && daysLeft <= 7) {
                suggestionMessage = `Likely to run out in ${Math.ceil(daysLeft)} days`;
            } else if (stock < Number(i.reorder_level)) {
                suggestionMessage = `Below reorder level`;
            }

            return {
                id: i.id,
                name: i.name,
                unit: i.unit,
                stock,
                lastPurchased: i.last_purchase_at,
                status,
                // reorderLevel: Number(i.reorder_level),
                // purchaseType: i.last_purchase_type,
                // avgDailyUsage: avg,
                // daysLeft,
                suggestionMessage,
            };
        });
        // console.log("[RAW ITEM] => ", items);
        // console.log("[MAPPED ITEM] => ", mapped);

        return response({
            message: "successfully fetched attention items",
            data: { items: mapped },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
