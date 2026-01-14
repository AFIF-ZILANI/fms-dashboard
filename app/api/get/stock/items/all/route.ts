import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { Item } from "@/types/purchase";

export async function GET() {
    try {
        const res = await prisma.item.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                unit: true,
                category: true,
                meta_data: true,
            },
        });
        const data: Item[] = [];
        res.forEach((item) => {
            const metadata = item.meta_data as Record<string, any> | null;
            if (
                metadata && (metadata.company ||
                metadata.brand ||
                metadata.manufacturer)
            ) {
                data.push({
                    id: item.id,
                    name: item.name,
                    unit: item.unit,
                    category: item.category,
                    company:
                        metadata.company ||
                        metadata.brand ||
                        metadata.manufacturer,
                });
            }
        });
        return response({
            message: "All purchase items retrieved successfully.",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
