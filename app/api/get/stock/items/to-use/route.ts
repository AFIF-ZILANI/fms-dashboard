
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { ItemInventoryForUse } from "@/types";
export async function GET() {
  try {
    const data = await prisma.$queryRaw<ItemInventoryForUse[]>`

      WITH location_stock AS (
        SELECT
          item_id,
          location_type,
          location_id,
          SUM(
            CASE
              WHEN direction = 'IN'  THEN quantity
              WHEN direction = 'OUT' THEN -quantity
              ELSE 0
            END
          ) AS stock
        FROM "StockLedger"
        GROUP BY item_id, location_type, location_id
      ),

      warehouse_stock AS (
        SELECT
          item_id,
          SUM(stock) AS warehouse_stock
        FROM location_stock
        WHERE location_type = 'WAREHOUSE'
        GROUP BY item_id
      ),

      house_stock_json AS (
        SELECT
          item_id,
          json_agg(
            json_build_object(
              'houseId', location_id,
              'quantity', stock
            )
          ) AS house_stocks
        FROM location_stock
        WHERE location_type = 'HOUSE'
          AND stock > 0
        GROUP BY item_id
      )

      SELECT
        i.id AS item_id,
        i.name,
        i.category,
        i.unit,
        comp.company,
        COALESCE(ws.warehouse_stock, 0) AS warehouse_stock,
        COALESCE(hsj.house_stocks, '[]'::json) AS house_reserved_stocks
      FROM "Item" i

      LEFT JOIN warehouse_stock ws
        ON ws.item_id = i.id

      LEFT JOIN house_stock_json hsj
        ON hsj.item_id = i.id

      LEFT JOIN LATERAL (
        SELECT o.label_name AS company
        FROM "ItemOrganization" io
        JOIN "Organization" o
          ON o.id = io.organization_id
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

    // console.log("[DATA] => ", JSON.stringify(data, null, 2));

    return response({
      data,
      message: "Ledger-based stock summary retrieved successfully",
    });

  } catch (error) {
    return errorResponse(error);
  }
}