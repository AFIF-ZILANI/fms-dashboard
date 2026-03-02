"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Wheat, Skull, Layers, Bird, Droplets, Activity } from "lucide-react";
// import CountUp from "../effects/count-up";
import { BatchOverviewToday } from "@/types/api";

type BatchGenaralCardGroupProp = {
    data: BatchOverviewToday;
};

export default function GeneralCardGroup({ data }: BatchGenaralCardGroupProp) {
    const metrics = [
        {
            title: "Active Batches",
            icon: Layers,
            value: data.activeBatches,
            description: "Number of batches currently running",
            color: "bg-blue-50 text-blue-600",
            borderColor: "border-blue-200",
        },
        {
            title: "Alive Birds",
            icon: Bird,
            value: data.aliveBirds?.toLocaleString("en-US"),
            description: "Total live birds across all batches",
            color: "bg-green-50 text-green-600",
            borderColor: "border-green-200",
        },
        {
            title: "Mortality Today",
            icon: Skull,
            value: data.mortality,
            description: `Birds lost today ${data.mortalityRate?.toFixed(2)}%`,
            color:
                (data.mortality ?? 0) > 0
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-50 text-gray-600",
            borderColor:
                (data.mortality ?? 0) > 0
                    ? "border-red-200"
                    : "border-gray-200",
        },
        {
            title: "Feed Consumed",
            icon: Wheat,
            value: data.feedConsumed,
            description: "Total feed consumed (CARB)",
            color: "bg-amber-50 text-amber-600",
            borderColor: "border-amber-200",
        },
        {
            title: "Water Consumed",
            icon: Droplets,
            value: data.waterConsumed,
            description: "Total water consumed (CARB)",
            color: "bg-cyan-50 text-cyan-600",
            borderColor: "border-cyan-200",
        },
        {
            title: "Water : Feed Ratio",
            icon: Activity,
            value: data.waterFeedRatio?.toFixed(2),
            description: "Health & stress indicator",
            color: "bg-purple-50 text-purple-600",
            borderColor: "border-purple-200",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {metrics.map((metric, i) => (
                <Card
                    key={i}
                    className={`rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                >
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {metric.title}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    {metric.description}
                                </CardDescription>
                            </div>
                            <div className={`p-2 rounded-lg ${metric.color}`}>
                                <metric.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                            {!metric.value ? "N/A" : metric.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
