"use client";
import { type LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    PackageX,
    Boxes,
    Repeat,
    Wallet,
    CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OverviewKPIProps } from "@/types/inventory/type";
import { Skeleton } from "@/components/ui/skeleton";

type State = "danger" | "warning" | "safe" | "neutral" | "muted";

type CardConfig = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    state: State;
    helper?: string;
    description: string;
};

export function InventoryKPIHeader({
    data: {
        outOfStock,
        lowStock,
        totalItems,
        movementsToday,
        inventoryValue,
        expiringSoon,
    },
    isLoading,
}: {
    data: OverviewKPIProps;
    isLoading: boolean;
}) {
    const cards = [
        {
            label: "Out of stock",
            value: outOfStock,
            icon: PackageX,
            state: outOfStock === 0 ? "safe" : "danger",
            helper: outOfStock === 0 ? "All good" : undefined,
            description: "Items with zero quantity",
        },
        {
            label: "Low stock",
            value: lowStock,
            icon: AlertTriangle,
            state: lowStock > 3 ? "warning" : "neutral",
            helper: lowStock === 0 ? "All good" : undefined,
            description: "Items below minimum threshold",
        },
        {
            label: "Total items",
            value: totalItems,
            icon: Boxes,
            state: "neutral",
            description: "Total inventory quantity",
        },
        {
            label: "Movements today",
            value: movementsToday,
            icon: Repeat,
            state: movementsToday === 0 ? "muted" : "neutral",
            helper: movementsToday === 0 ? "No activity" : undefined,
            description: "Stock movements in the last 24 hours",
        },

        // ⏳ Expiring soon (ONLY if provided)
        expiringSoon !== undefined && {
            label: "Expiring soon",
            value: expiringSoon,
            icon: AlertTriangle,
            state: expiringSoon > 0 ? "warning" : "neutral",
            helper: lowStock === 0 ? "All good" : undefined,
            description: "Items expiring within 30 days",
        },

        inventoryValue !== undefined && {
            label: "Inventory value",
            value: `৳${formatCompact(inventoryValue)}`,
            icon: Wallet,
            state: "neutral",
            description: "Total inventory monetary value",
        },
    ].filter((c): c is NonNullable<typeof c> => Boolean(c));

    return (
        <section className="w-full">
            {/* Mobile: horizontal scroll */}
            {isLoading && (
                <div className="flex gap-2">
                    <Skeleton className="h-70 w-60" />
                    <Skeleton className="h-70 w-28" />
                </div>
            )}
            {!isLoading && (
                <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
                    {cards.map((card: any, i) => (
                        <KpiCard key={i} {...card} />
                    ))}
                </div>
            )}

            {/* Desktop: 2 rows × 3 columns */}
            <div className="hidden md:grid grid-cols-3 gap-4">
                {!isLoading &&
                    cards.map((card: any, i) => <KpiCard key={i} {...card} />)}

                {isLoading && (
                    <>
                        <Skeleton className="h-60 w-full" />
                        <Skeleton className="h-60 w-full" />
                        <Skeleton className="h-60 w-full" />
                        <Skeleton className="h-60 w-full" />
                        <Skeleton className="h-60 w-full" />
                        <Skeleton className="h-60 w-full" />
                    </>
                )}
            </div>
        </section>
    );
}

function KpiCard({
    label,
    value,
    icon: Icon,
    state,
    helper,
    description,
}: CardConfig) {
    const iconBgColor = {
        danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        warning:
            "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        safe: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        neutral:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        muted: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    };

    return (
        <Card className="min-w-[200px] rounded-lg border overflow-hidden">
            <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {label}
                        </span>
                    </div>
                    <div
                        className={cn(
                            "p-2.5 rounded-lg",
                            iconBgColor[state as keyof typeof iconBgColor]
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div>
                    <div className="text-3xl font-bold tracking-tight">
                        {value}
                    </div>
                </div>

                {helper && (
                    <div className="text-xs flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {helper}
                    </div>
                )}

                {description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function formatCompact(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
}
