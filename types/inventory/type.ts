import { ResourceCategories, StockReason } from "@/app/generated/prisma/enums";

export const VALID_STATUSES = ["OK", "LOW", "OUT", "NOT_INITIALIZED"] as const;
export const VALID_SORT_FIELDS = ["name", "stock", "lastUpdated"] as const;
export const VALID_SORT_ORDERS = ["asc", "desc"] as const;

export type OverviewKPIProps = {
    outOfStock: number;
    lowStock: number;
    totalItems: number;
    movementsToday: number;
    inventoryValue?: number;
    expiringSoon?: number;
};

export type AttentionItem = {
    id: string;
    name: string;
    unit: string;
    stock: number;
    reorderLevel: number;
    lastPurchased: Date | null;
    status: ValidStatus;
    purchaseType: "PURCHASE" | "OPENING_BALANCE" | null;
};

export type InventoryItem = {
    id: string;
    name: string;
    category: ResourceCategories;
    unit: string;
    lastMovement: Date;
    movementType: StockReason;
    movementQuantity: number;
    stock: number;
    status: ValidStatus;
};

export type ValidStatus = (typeof VALID_STATUSES)[number];
export type ValidSortField = (typeof VALID_SORT_FIELDS)[number];
export type ValidSortOrder = (typeof VALID_SORT_ORDERS)[number];
