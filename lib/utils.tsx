import { StockReason } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { ValidStatus } from "@/types/inventory/type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEnums } from "./strings";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const parsePositiveInt = (
    value: string | null,
    defaultValue: number,
    max?: number
): number => {
    const parsed = Number(value);
    const result =
        isNaN(parsed) || parsed < 1 ? defaultValue : Math.floor(parsed);
    return max ? Math.min(result, max) : result;
};

export function getStatusBadge(status: ValidStatus) {
    const map = {
        ok: "bg-green-100 text-green-800",
        low: "bg-amber-100 text-amber-800",
        out: "bg-red-100 text-red-800",
    };

    return (
        <Badge className={cn("text-xs font-bold", map[status])}>
            {status.toUpperCase()}
        </Badge>
    );
}

export function getItemsCardMetaData(type: StockReason, quantity: number) {
    if (type === "PURCHASE" || type === "OPENING_BALANCE") {
        return (
            <div className="flex gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                    {formatEnums(type)}
                </span>
                <span className="text-xs font-bold text-green-500">
                    +{quantity}
                </span>
            </div>
        );
    } else {
        return (
            <div className="flex gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                    {formatEnums(type)}
                </span>
                <span className="text-xs font-bold text-red-500">
                    -{quantity}
                </span>
            </div>
        );
    }
}
