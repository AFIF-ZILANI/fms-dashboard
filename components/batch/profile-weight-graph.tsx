"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "../empty-chart-error";

export const description = "Weight chart (age in days)";

const chartConfig = {
    weight: {
        label: "Weight",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export default function WeightRecordChart({
    data,
}: {
    data?: {
        week: number;
        avgWeight: number;
        sampleSize: number;
        age: number;
    }[];
}) {
    console.log(data);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weight Record</CardTitle>
                <CardDescription>
                    Showing weight record by age (days)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data && data.length ? (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="age"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                label={{
                                    value: "Age (days)",
                                    position: "insideBottom",
                                    offset: -7,
                                }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />

                            <ChartTooltip content={<ChartTooltipContent />} />

                            <Line
                                dataKey="avgWeight"
                                type="monotone"
                                stroke="var(--chart-1)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <ChartEmptyState />
                )}
            </CardContent>
        </Card>
    );
}
