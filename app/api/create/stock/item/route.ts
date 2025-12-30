import { errorResponse, response } from "@/lib/apiResponse";
import { addStockItemSchema } from "@/schemas/item.schem";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = addStockItemSchema.parse(body);
        return response({
            message: "",
        });
    } catch (error) {
        return errorResponse(error);
    }
}