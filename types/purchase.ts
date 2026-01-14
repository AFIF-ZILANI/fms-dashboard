import { ResourceCategories } from "@/app/generated/prisma/enums";

export type PurchaseLine = {
    itemId: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
};

export type Item = {
    id: string;
    name: string;
    category: ResourceCategories;
    unit: string;
    company: string;
};

export type PurchaseItem = {
    tempId: string;
    itemId?: string;
    itemName?: string;
    unit?: string;
    qty: number;
    unitPrice: number;
};
