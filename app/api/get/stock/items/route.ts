import prisma from "@/lib/prisma";
import { response } from "@/lib/apiResponse";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            skip,
            take: limit,
            orderBy: { name: "asc" },
        }),
        prisma.item.count(),
    ]);

    return response({
        message: "All stock items retrieved successfully.",
        data: {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
}
