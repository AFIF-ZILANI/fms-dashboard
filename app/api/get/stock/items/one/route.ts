import { errorResponse, response } from "@/lib/apiResponse";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        console.log("[ID] => ", id);
        if (!id) {
            throwError({
                message: "Id is missing",
                statusCode: 400,
            });
        }

        const result = await prisma.$queryRaw<{ stock: number }[]>`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN direction = 'IN' THEN quantity
            WHEN direction = 'OUT' THEN -quantity
          END
        ), 0) AS stock
      FROM "StockLedger"
      WHERE item_id = ${id};
    `;

        const stock = result[0]?.stock ?? 0;

        console.log(result);
        return response({
            data: stock,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
