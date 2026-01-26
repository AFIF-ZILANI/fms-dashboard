import { errorResponse, response } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { OverviewKPIProps } from "@/types/inventory/type";

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Expiring soon threshold (e.g., 30 days from now)
        const expiringThreshold = new Date();
        expiringThreshold.setDate(expiringThreshold.getDate() + 30);

        // 1. Get all items with their current stock
        const items = await prisma.item.findMany();

        // 2. Calculate current stock for each item
        const stockPromises = items.map(async (item) => {
            const stockLedgers = await prisma.stockLedger.findMany({
                where: { item_id: item.id },
            });

            const currentStock = stockLedgers.reduce((total, ledger) => {
                return total + Number(ledger.quantity);
            }, 0);

            return {
                itemId: item.id,
                currentStock,
                reorderLevel: item.reorder_level,
            };
        });

        const itemStocks = await Promise.all(stockPromises);

        // 3. Get today's movements
        const movementsToday = await prisma.stockLedger.count({
            where: {
                occurred_at: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // 4. Get expiring items count
        // First, get all purchase items that are expiring soon
        // const expiringPurchaseItems = await prisma.purchaseItem.findMany({
        //     where: {
        //         AND: [
        //             { expiration_date: { not: null } },
        //             { expiration_date: { lte: expiringThreshold } },
        //             { expiration_date: { gte: today } } // Not expired yet
        //         ]
        //     },
        //     select: {
        //         id: true,
        //         item_id: true,
        //         expiration_date: true,
        //         quantity: true,
        //         received_quantity: true
        //     }
        // });

        // 5. Calculate remaining stock for each expiring batch
        // This is more complex because we need to track how much of each batch is left
        // const expiringItemIds = new Set<string>();

        // for (const purchaseItem of expiringPurchaseItems) {
        //     // Calculate how much of this batch is still in stock
        //     const remainingStock = await calculateRemainingBatchStock(purchaseItem.id);

        //     if (remainingStock > 0) {
        //         expiringItemIds.add(purchaseItem.item_id);
        //     }
        // }

        // 6. Calculate KPIs
        const totalItems = items.length;
        const outOfStock = itemStocks.filter(
            (stock) => stock.currentStock <= 0
        ).length;
        const lowStock = itemStocks.filter(
            (stock) =>
                stock.currentStock > 0 &&
                stock.currentStock < Number(stock.reorderLevel)
        ).length;
        // const expiringSoon = expiringItemIds.size;

        // 7. Optional: Calculate inventory value
        const inventoryValue = await calculateInventoryValue();

        const kpiData: OverviewKPIProps = {
            outOfStock,
            lowStock,
            totalItems,
            movementsToday,
            // expiringSoon,
            inventoryValue,
        };

        return response({
            message: "KPIs fetched successfully",
            data: kpiData,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

// Helper function to calculate remaining stock for a purchase batch
async function calculateRemainingBatchStock(
    purchaseItemId: string
): Promise<number> {
    // First, get the original quantity from purchase
    const purchaseItem = await prisma.purchaseItem.findUnique({
        where: { id: purchaseItemId },
        select: { quantity: true },
    });

    if (!purchaseItem) return 0;

    const originalQuantity = Number(purchaseItem.quantity);

    // Find all stock ledger entries that reference this purchase item
    // You need to store the purchase_item_id in stockLedger when creating entries
    const relatedLedgers = await prisma.stockLedger.findMany({
        where: {
            ref_type: "PURCHASE",
            ref_id: purchaseItemId,
        },
    });

    // Sum up all movements for this batch
    const totalMoved = relatedLedgers.reduce((sum, ledger) => {
        return sum + Number(ledger.quantity);
    }, 0);

    // Remaining = original quantity - total moved (where moved is negative for sales/consumption)
    return originalQuantity - Math.abs(totalMoved);
}

// Helper function to calculate inventory value
async function calculateInventoryValue(): Promise<number | undefined> {
    try {
        // Method 1: Weighted average cost
        const itemsWithValue = await prisma.item.findMany({
            include: {
                ledger_entries: {
                    where: {
                        OR: [
                            { reason: "PURCHASE" },
                            { reason: "SALE" },
                            { reason: "CONSUMPTION" },
                        ],
                    },
                    orderBy: { occurred_at: "asc" },
                },
            },
        });

        let totalValue = 0;

        for (const item of itemsWithValue) {
            let currentStock = 0;
            let weightedAverageCost = 0;
            let totalCost = 0;
            let totalQuantity = 0;

            // Calculate using weighted average method
            for (const ledger of item.ledger_entries) {
                const quantity = Number(ledger.quantity);

                if (quantity > 0 && ledger.unit_cost) {
                    // Purchase - add to stock
                    totalCost += quantity * Number(ledger.unit_cost);
                    totalQuantity += quantity;
                    weightedAverageCost = totalCost / totalQuantity;
                    currentStock += quantity;
                } else if (quantity < 0) {
                    // Sale/Consumption - reduce stock using current average cost
                    currentStock += quantity; // quantity is negative
                }
            }

            // Calculate value of remaining stock
            if (currentStock > 0) {
                totalValue += currentStock * weightedAverageCost;
            }
        }

        return totalValue;
    } catch (error) {
        console.error("Error calculating inventory value:", error);
        return undefined;
    }
}
