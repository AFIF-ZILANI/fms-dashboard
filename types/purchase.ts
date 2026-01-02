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
    unit: string;
};

export type PurchaseItem = {
    tempId: string;
    itemId?: string;
    itemName?: string;
    unit?: string;
    qty: number;
    unitPrice: number;
};