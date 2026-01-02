import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { ActorSearchItem } from "@/types";
import { NextRequest } from "next/server";

const MIN_QUERY_LENGTH = 2;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim() || "";
        const category = searchParams.get("cat");

        if (q.length < MIN_QUERY_LENGTH) {
            return response({
                message: "Query too short",
                data: [],
            });
        }

        if (!category) {
            return response({
                message: "Category is required",
                data: [],
            });
        }

        let results: ActorSearchItem[] = [];

        switch (category) {
            case "SUPPLIER": {
                console.log("Hello")
                const res = await prisma.profiles.findMany({
                    where: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                        role: "SUPPLIER",
                    },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                    },
                });

                console.log(res)

                results = res.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: "SUPPLIER",
                }));
                break;
            }

            case "CUSTOMER": {
                const res = await prisma.profiles.findMany({
                    where: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                        role: "CUSTOMER",
                    },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                    },
                });

                results = res.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: "CUSTOMER",
                }));
                break;
            }

            case "ADMIN": {
                const res = await prisma.profiles.findMany({
                    where: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                        role: "ADMIN",
                    },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                    },
                });

                results = res.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: "ADMIN",
                }));
                break;
            }
            case "DOCTOR": {
                const res = await prisma.profiles.findMany({
                    where: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                        role: "DOCTOR",
                    },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                    },
                });

                results = res.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: "DOCTOR",
                }));
                break;
            }
            case "EMPLOYEE": {
                const res = await prisma.profiles.findMany({
                    where: {
                        name: {
                            contains: q,
                            mode: "insensitive",
                        },
                        role: "EMPLOYEE",
                    },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                    },
                });

                results = res.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: "EMPLOYEE",
                }));
                break;
            }

            default:
                return response({
                    message: "Unsupported category",
                    data: [],
                });
        }

        console.log(results);

        return response({
            message: "Success",
            data: results,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
