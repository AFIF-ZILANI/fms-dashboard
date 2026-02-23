import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { ItemInventorySummary } from "@/types";

export async function GET() {
  try {
    const data = await prisma.$queryRaw<ItemInventorySummary[]>`
  WITH stock AS (
    SELECT 
      sl.item_id,
      SUM(
        CASE 
          WHEN sl.direction = 'IN' THEN sl.quantity
          WHEN sl.direction = 'OUT' THEN -sl.quantity
        END
      ) AS current_stock
    FROM "StockLedger" sl
    GROUP BY sl.item_id
  ),
  reserved AS (
    SELECT 
      sr.item_id,
      SUM(sr.quantity) AS total_reserved
    FROM "StockReservation" sr
    GROUP BY sr.item_id
  ),
  consumed AS (
    SELECT 
      sl.item_id,
      SUM(sl.quantity) AS total_consumed
    FROM "StockLedger" sl
    WHERE 
      sl.reason = 'CONSUMPTION'
      AND sl.direction = 'OUT'
      AND sl.ref_type = 'STOCK_RESERVATION'
    GROUP BY sl.item_id
  )
  SELECT 
    i.id AS item_id,
    i.name,
    i.category,
    i.unit,
    comp.company,
    COALESCE(s.current_stock, 0) AS current_stock,
    COALESCE(r.total_reserved, 0) 
      - COALESCE(c.total_consumed, 0) 
      AS alive_reserved_qty
  FROM "Item" i
  LEFT JOIN stock s ON s.item_id = i.id
  LEFT JOIN reserved r ON r.item_id = i.id
  LEFT JOIN consumed c ON c.item_id = i.id

  LEFT JOIN LATERAL (
    SELECT o.label_name AS company
    FROM "ItemOrganization" io
    JOIN "Organization" o ON o.id = io.organization_id
    WHERE io.item_id = i.id
    ORDER BY 
      CASE io.role
        WHEN 'MANUFACTURER' THEN 1
        WHEN 'IMPORTER' THEN 2
        WHEN 'MARKETER' THEN 3
        WHEN 'DISTRIBUTOR' THEN 4
        ELSE 5
      END
    LIMIT 1
  ) comp ON TRUE

  ORDER BY i.name ASC
`;

    // console.log(data);
    if (!data.length) {
      throwError({
        message: "No items found",
        statusCode: 404
      })
    }


    return response({
      message: "All purchase items retrieved successfully.",
      data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}