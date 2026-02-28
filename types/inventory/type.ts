import { ResourceCategories, StockReason } from "@/app/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";

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
    // reorderLevel: number;
    lastPurchased: Date | null;
    status: "LOW" | "OUT" | "NOT_INITIALIZED";
    // purchaseType: "PURCHASE" | "OPENING_BALANCE" | null;
    // avgDailyUsage: number | null;
    // daysLeft: number | null;
    suggestionMessage: string | null;
};

export type InventoryItem = {
    id: string;
    name: string;
    category: ResourceCategories;
    unit: string;
    lastMovement: Date | null;
    movementType: StockReason | null;
    movementQuantity: number | null;
    warehouseStock: number;
    houseReservedStock: number;
    status: ValidStatus;
};

export type ValidStatus = (typeof VALID_STATUSES)[number];
export type ValidSortField = (typeof VALID_SORT_FIELDS)[number];
export type ValidSortOrder = (typeof VALID_SORT_ORDERS)[number];


export type LeftoverFeed = {
    id: string;
    house_id: string;
    item_id: string;
    quantity_remaining: Decimal;
    last_modified_by: string;
    updated_at: Date;
}