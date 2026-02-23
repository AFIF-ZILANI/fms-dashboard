import { OrganizationRole, Prisma } from "@/app/generated/prisma/client";
import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { normalizeItemName } from "@/lib/strings";
import { addStockItemSchema } from "@/schemas/item.schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body);

        const data = addStockItemSchema.parse(body);

        const normalizedName = normalizeItemName(data.name);
        await prisma.$transaction(async (tx) => {
            const item = await tx.item.create({
                data: {
                    name: data.name,
                    normalized_key: normalizedName,
                    category: data.category,
                    unit: data.unit,
                    reorder_level: data.reorderLevel,
                    meta_data: data.isMetaDataAvailable
                        ? data.metaData || {}
                        : Prisma.JsonNull, // <-- use Prisma.JsonNull instead of null
                },
            });

            if (data.manufacturerId) {
                const organization = await tx.organization.findUnique({
                    where: {
                        id: data.manufacturerId,
                    },
                });
                if (!organization) {
                    throw new Error("Organization not found");
                }
                await tx.itemOrganization.create({
                    data: {
                        item_id: item.id,
                        role: OrganizationRole.MANUFACTURER,
                        organization_id: data.manufacturerId,
                    },
                });
            }

            if (data.importerId) {
                const organization = await tx.organization.findUnique({
                    where: {
                        id: data.importerId,
                    },
                });
                if (!organization) {
                    throw new Error("Organization not found");
                }
                await tx.itemOrganization.create({
                    data: {
                        item_id: item.id,
                        role: OrganizationRole.IMPORTER,
                        organization_id: data.importerId,
                    },
                });
            }

            if (data.marketerId) {
                const organization = await tx.organization.findUnique({
                    where: {
                        id: data.marketerId,
                    },
                });
                if (!organization) {
                    throw new Error("Organization not found");
                }
                await tx.itemOrganization.create({
                    data: {
                        item_id: item.id,
                        role: OrganizationRole.MARKETER,
                        organization_id: data.marketerId,
                    },
                });
            }

            if (data.distributorId) {
                const organization = await tx.organization.findUnique({
                    where: {
                        id: data.distributorId,
                    },
                });
                if (!organization) {
                    throw new Error("Organization not found");
                }
                await tx.itemOrganization.create({
                    data: {
                        item_id: item.id,
                        role: OrganizationRole.DISTRIBUTOR,
                        organization_id: data.distributorId,
                    },
                });
            }
        });
        return response({ message: "Success" });
    } catch (error) {
        return errorResponse(error);
    }
}
