"use client";

import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types/inventory/type";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    WarehouseIcon as Warehouse,
    PackageCheck,
} from "lucide-react";
import { getItemsCardMetaData, getStatusBadge } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEnums } from "@/lib/strings";

interface InventoryMobileListProps {
    data: InventoryItem[];
    isFetching: boolean;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onItemClick: (itemId: string) => void;
}

export function InventoryMobileList({
    data,
    pageIndex,
    pageSize,
    totalPages,
    isFetching,
    onPageChange,
    onPageSizeChange,
    onItemClick,
}: InventoryMobileListProps) {
    const isEmpty = data.length === 0;

    return (
        <div className="space-y-3">
            {/* Item Cards */}
            {isEmpty && !isFetching && (
                <Card className="p-8 text-center border-0 shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                            <svg
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                No items found
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Try adjusting your filters
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {!isEmpty &&
                !isFetching &&
                data.map((item) => {
                    return (
                        <Card
                            key={item.id}
                            className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md active:scale-95 transition-all"
                            onClick={() => onItemClick(item.id)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <div className="mb-4 space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                                        {formatEnums(
                                                            item.category
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                                            {getStatusBadge(item.status)}
                                            {item.movementQuantity &&
                                                item.movementType &&
                                                getItemsCardMetaData(
                                                    item.movementType,
                                                    item.movementQuantity
                                                )}
                                            {item.status ===
                                                "NOT_INITIALIZED" && (
                                                <div className="flex gap-2 text-muted-foreground">
                                                    <span className="text-xs font-medium">
                                                        No Movement Yet
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Warehouse and Reserved Stock */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-muted rounded-lg border border-border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-background rounded-md">
                                                    <Warehouse className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Warehouse
                                                </span>
                                            </div>
                                            <p className="text-base font-bold text-foreground">
                                                {item.warehouseStock}
                                                <span className="text-xs font-medium text-muted-foreground ml-1">
                                                    {item.unit}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="p-3 bg-muted rounded-lg border border-border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-background rounded-md">
                                                    <PackageCheck className="w-4 h-4 text-destructive" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Reserved
                                                </span>
                                            </div>
                                            <p className="text-base font-bold text-foreground">
                                                {item.houseReservedStock}
                                                <span className="text-xs font-medium text-muted-foreground ml-1">
                                                    {item.unit}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

            {/* Loading Screen */}

            {isEmpty && isFetching && (
                <div className="space-y-3">
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                </div>
            )}

            {/* Pagination */}
            {!isEmpty && (
                <Card className="p-4 border-0 shadow-sm space-y-2">
                    <div className="text-xs font-medium text-muted-foreground text-center">
                        Page {pageIndex} of {totalPages}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => onPageChange(1)}
                                disabled={pageIndex <= 1 || isFetching}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <ChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => onPageChange(pageIndex - 1)}
                                disabled={pageIndex <= 1 || isFetching}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => onPageChange(pageIndex + 1)}
                                disabled={totalPages <= pageIndex || isFetching}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => onPageChange(totalPages)}
                                disabled={totalPages <= pageIndex || isFetching}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight />
                            </Button>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-muted/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Items per page
                            </span>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => {
                                    onPageSizeChange(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 25, 30, 40, 50].map(
                                        (pageSize) => (
                                            <SelectItem
                                                key={pageSize}
                                                value={`${pageSize}`}
                                            >
                                                {pageSize}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
