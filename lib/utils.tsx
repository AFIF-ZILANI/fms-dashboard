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
        OK: "bg-green-100 text-green-800",
        LOW: "bg-amber-100 text-amber-800",
        OUT: "bg-red-100 text-red-800",
        NOT_INITIALIZED: "bg-blue-100 text-blue-800",
    };

    return (
        <Badge className={cn("text-xs font-bold", map[status])}>
            {formatEnums(status)}
        </Badge>
    );
}

export function getItemsCardMetaData(type: StockReason, quantity: number) {
    if (type === "PURCHASE" || type === "OPENING_BALANCE") {
        return (
            <div className="flex gap-2 text-green-500">
                <span className="text-xs font-medium">{formatEnums(type)}</span>
                <span className="text-xs font-bold">+{quantity}</span>
            </div>
        );
    } else if (type === "CONSUMPTION") {
        return (
            <div className={cn("flex gap-2 text-red-500")}>
                <span className="text-xs font-medium">{formatEnums(type)}</span>
                <span className="text-xs font-bold">{quantity}</span>
            </div>
        );
    } else {
        return (
            <div className={cn("flex gap-2 text-yellow-500")}>
                <span className="text-xs font-medium">{formatEnums(type)}</span>
                <span className="text-xs font-bold">-{quantity}</span>
            </div>
        );
    }
}

export const formatQty = (value: number | string) =>
    parseFloat(Number(value).toFixed(3));
