import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import CountUp from "../effects/count-up";
import { ProfileKPIsProps } from "@/types";
import { formatFeedInBags } from "@/lib/bird-man";
import { Skeleton } from "../ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    Bird,
    Skull,
    Percent,
    Wheat,
    Calendar,
    Weight,
    Activity,
    AlertTriangle,
} from "lucide-react";

type State = "danger" | "warning" | "safe" | "neutral" | "muted";

export type CardConfig = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    state: State;
    description: string;
};

export default function ProfileKPIs({
    totalAliveBirds,
    totalFeedConsumed,
    totalMortality,
    mortalityRate,
    mortalityToday,
    avgBodyWeightLatest,
    numberOfSeriousDeseasesHappen,
    fcr,
    isLoading,
}: ProfileKPIsProps) {
    const metrics: {
        icon: any;
        title: string;
        value: string | number;
        description: string;
        state: State;
    }[] = [
        {
            icon: Bird,
            title: "Live Birds",
            value: totalAliveBirds,
            description: "Total number of live birds in this Batch",
            state: "safe",
        },
        {
            icon: Skull,
            title: "Total Mortality",
            value: totalMortality,
            description: "Total number of mortalities in this Batch",
            state:
                totalMortality === 0
                    ? "safe"
                    : totalMortality < 10
                      ? "warning"
                      : "danger",
        },
        {
            icon: Percent,
            title: "Mortality Rate",
            value: mortalityRate ? `${mortalityRate.toFixed(2)}%` : "N/A",
            description: "Percentage of birds that have died",
            state:
                mortalityRate === undefined
                    ? "muted"
                    : mortalityRate < 3
                      ? "safe"
                      : mortalityRate < 5
                        ? "warning"
                        : "danger",
        },
        {
            icon: Wheat,
            title: "Total Feed Consumed (kg)",
            value: formatFeedInBags(totalFeedConsumed),
            description: "Total feed consumed by the birds",
            state: "neutral",
        },
        {
            icon: Calendar,
            title: "Mortality Today",
            value: mortalityToday,
            description: "Number of mortalities recorded today",
            state:
                mortalityToday === 0
                    ? "safe"
                    : mortalityToday <= 2
                      ? "warning"
                      : "danger",
        },
        {
            icon: Weight,
            title: "Avg Weight (Latest) (g)",
            value: avgBodyWeightLatest ?? "N/A",
            description:
                "Average body weight of birds from the latest measurement",
            state: avgBodyWeightLatest ? "safe" : "muted",
        },
        {
            icon: Activity,
            title: "FCR",
            value: fcr ? fcr.toFixed(2) : "N/A",
            description: "Feed Conversion Ratio",
            state:
                fcr === undefined
                    ? "muted"
                    : fcr <= 1.8
                      ? "safe"
                      : fcr <= 2
                        ? "warning"
                        : "danger",
        },
        {
            icon: AlertTriangle,
            title: "Serious Diseases",
            value: numberOfSeriousDeseasesHappen ?? "N/A",
            description: "Number of serious diseases recorded in this Batch",
            state:
                numberOfSeriousDeseasesHappen === 0
                    ? "safe"
                    : (numberOfSeriousDeseasesHappen ?? 0) <= 1
                      ? "warning"
                      : "danger",
        },
    ];
    return (
        <>
            <section className="w-full">
                {/* Mobile: horizontal scroll */}
                {isLoading && (
                    <div className="flex gap-2 md:hidden">
                        <Skeleton className="h-70 w-60" />
                        <Skeleton className="h-70 w-28" />
                    </div>
                )}
                {!isLoading && (
                    <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
                        {metrics.map((card, i) => (
                            <KpiCard key={i} {...card} />
                        ))}
                    </div>
                )}

                {/* Desktop: 2 rows × 3 columns */}
                <div className="hidden md:grid grid-cols-3 gap-4">
                    {!isLoading &&
                        metrics.map((card, i) => <KpiCard key={i} {...card} />)}

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
        </>
    );
}

function KpiCard({ title, value, icon: Icon, description, state }: CardConfig) {
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
                            {title}
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

                {description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
