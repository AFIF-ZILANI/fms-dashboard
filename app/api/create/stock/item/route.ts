import { Prisma } from "@/app/generated/prisma/client";
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { addStockItemSchema } from "@/schemas/item.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body);

        const data = addStockItemSchema.parse(body);

        await prisma.item.create({
            data: {
                name: data.name,
                category: data.category,
                unit: data.unit,
                meta_data: data.isMetaDataAvailable
                    ? data.metaData || {}
                    : Prisma.JsonNull, // <-- use Prisma.JsonNull instead of null
            },
        });

        return response({ message: "Success" });
    } catch (error) {
        return errorResponse(error);
    }
}
