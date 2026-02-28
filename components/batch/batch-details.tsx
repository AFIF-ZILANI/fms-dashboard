import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDateInBritish } from "@/lib/date-time";
import { TooltipCreator } from "@/lib/strings";
import { ProfileBatchDetailsProps } from "@/types";
import { Badge } from "@/components/ui/badge";

interface InfoItemProps {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
}

function InfoItem({ label, value, highlight = false }: InfoItemProps) {
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <span
                className={`text-base font-semibold ${highlight ? "text-primary" : "text-foreground"}`}
            >
                {value}
            </span>
        </div>
    );
}

function InfoSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
                {title}
            </h3>
            <div className="space-y-6">{children}</div>
        </div>
    );
}

export default function BatchDetails({
    batchId,
    batchStart,
    breed,
    mortality24H,
    mortality48H,
    mortality72H,
    supplier,
    daysToSell,
    expectedSell,
    initialQuantity,
    age,
    phase,
}: ProfileBatchDetailsProps) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">
                            Batch Information
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Comprehensive overview of the current batch
                            performance and details
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className="px-3 py-1 text-sm font-semibold"
                    >
                        {phase}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* --- Column 1: Identity --- */}
                    <div className="space-y-0">
                        <InfoSection title="Batch Identity">
                            <InfoItem
                                label="Batch ID"
                                value={
                                    batchId && <TooltipCreator text={batchId} />
                                }
                                highlight
                            />
                            <InfoItem label="Breed" value={breed} />
                            <InfoItem
                                label="Age"
                                value={`${age} Days`}
                                highlight
                            />
                        </InfoSection>
                    </div>

                    {/* --- Column 2: Timeline --- */}
                    <div className="space-y-0">
                        <InfoSection title="Timeline & Supply">
                            <InfoItem
                                label="Batch Start"
                                value={formatDateInBritish(batchStart)}
                            />
                            <InfoItem
                                label="Expected Sell"
                                value={formatDateInBritish(expectedSell)}
                                highlight
                            />
                            <InfoItem
                                label="Time to Sell"
                                value={`${daysToSell} Days ± 5`}
                            />
                            <InfoItem
                                label="Initial Quantity"
                                value={`${initialQuantity.toLocaleString("en-US")} Birds`}
                                highlight
                            />
                            <div className="pt-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Suppliers
                                </p>
                                <div className="space-y-1.5">
                                    {supplier.map((sup, index) => (
                                        <div
                                            key={index}
                                            className="text-sm font-medium text-foreground"
                                        >
                                            <TooltipCreator text={sup} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </InfoSection>
                    </div>

                    {/* --- Column 3: Health --- */}
                    <div className="space-y-0">
                        <InfoSection title="Health Metrics">
                            <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                                <InfoItem
                                    label="Mortality 24H"
                                    value={
                                        mortality24H
                                            ? mortality24H
                                            : "Not Recorded"
                                    }
                                />
                                <div className="border-t border-border pt-4" />
                                <InfoItem
                                    label="Mortality 48H"
                                    value={
                                        mortality48H
                                            ? mortality48H
                                            : "Not Recorded"
                                    }
                                />
                                <div className="border-t border-border pt-4" />
                                <InfoItem
                                    label="Mortality 72H"
                                    value={
                                        mortality72H
                                            ? mortality72H
                                            : "Not Recorded"
                                    }
                                />
                            </div>
                        </InfoSection>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
