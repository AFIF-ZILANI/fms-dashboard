"use client";

import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AttentionItem } from "@/types/inventory/type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEnums } from "@/lib/strings";
import { formatDate } from "@/lib/dateUtils";

type NeedsAttentionProps = {
    items: AttentionItem[];
    isLoading: boolean;
    onBuy?: (itemId: string) => void;
    maxItemsToShow?: number;
};

export function NeedsAttention({
    items,
    onBuy,
    isLoading,
    maxItemsToShow = 3,
}: NeedsAttentionProps) {
    const criticalItems = items.slice(0, maxItemsToShow);
    const hasMore = items.length > maxItemsToShow;

    if (items.length === 0 && !isLoading) {
        return (
            <Card className="border-green-300 dark:border-green-900/50 bg-linear-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-950 mt-8">
                <div className="p-4 sm:p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3 sm:items-center">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">
                                All good
                            </h2>
                            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
                                All items are well stocked and inventory is
                                secure.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-red-300 dark:border-red-900/50 bg-linear-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-950 mt-8">
            <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                {/* Header */}
                <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100">
                        Needs Attention
                    </h2>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-3 sm:gap-3">
                    {!isLoading &&
                        criticalItems.map((item) => (
                            <div
                                key={item.id}
                                className=" flex justify-between p-4 space-y-4 rounded-lg bg-white border border-transparent"
                            >
                                {/* Item info */}
                                <div className="flex gap-12">
                                    <div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm sm:text-base leading-snug mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                                {item.stock}{" "}
                                                {formatEnums(item.unit)}
                                            </p>
                                        </div>
                                        {/* {item.lastPurchased !== null &&
                                            item.purchaseType !== null && (
                                                <p className="text-xs mt-4 text-muted-foreground">
                                                    {formatEnums(
                                                        item.purchaseType
                                                    )}
                                                    {formatDate(
                                                        item.lastPurchased
                                                    )}
                                                </p>
                                            )} */}
                                    </div>
                                    <Badge
                                        variant={
                                            item.status === "OUT"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                        className={cn(
                                            "text-xs font-semibold h-fit",
                                            item.status === "OUT" &&
                                                "bg-red-600 hover:bg-red-700 text-white",
                                            item.status === "LOW" &&
                                                "bg-amber-500 hover:bg-amber-600 text-white",
                                            item.status === "NOT_INITIALIZED" &&
                                                "bg-black hover:bg-black/80 text-white"
                                        )}
                                    >
                                        {formatEnums(item.status)}
                                    </Badge>
                                </div>

                                {/* Status badge + Action button - Mobile stacked, Desktop inline */}

                                <Link
                                    href={`/purchases/items/new?id=${item.id}`}
                                >
                                    <Button
                                        className="active:scale-95 transition-transform"
                                        onClick={() => onBuy?.(item.id)}
                                    >
                                        Buy
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    {isLoading && (
                        <div className="space-y-3">
                            <Skeleton className="w-full h-24" />
                            <Skeleton className="w-full h-24" />
                            <Skeleton className="w-full h-24" />
                        </div>
                    )}
                </div>

                {/* View All Link */}
                {hasMore && (
                    <Link href={"/inventroy/items/critical"}>
                        <span className="text-xs sm:text-sm font-medium text-red-600 flex items-center gap-1.5 pt-2 transition-colors self-start">
                            View all {items.length} items
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </Link>
                )}
            </div>
        </Card>
    );
}
