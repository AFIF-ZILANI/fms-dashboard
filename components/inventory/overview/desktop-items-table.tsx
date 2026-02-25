"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { getStatusBadge } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { formatEnums } from "@/lib/strings";
import { InventoryItem } from "@/types/inventory/type";

interface InventoryTableProps {
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

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { formatDate } from "@/lib/dateUtils";

export function InventoryTable(props: InventoryTableProps) {
    const {
        data,
        pageIndex,
        pageSize,
        totalPages,
        onPageChange,
        onPageSizeChange,
        onItemClick,
    } = props;

    const table = useReactTable({
        data: data,
        columns: inventoryColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: totalPages,
    });

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={inventoryColumns.length}
                                    className="text-center py-10"
                                >
                                    No items found
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onItemClick(row.original.id)}
                                    className="cursor-pointer hover:bg-muted/40"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination stays same */}
            <Card className="flex justify-end w-full p-4">
                <CardContent>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">
                                    Rows per page
                                </p>
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
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {pageIndex + 1} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden size-8 lg:flex"
                                    onClick={() => onPageChange(0)}
                                    disabled={pageIndex <= 0}
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
                                    disabled={pageIndex <= 0}
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
                                    disabled={totalPages <= pageIndex}
                                >
                                    <span className="sr-only">
                                        Go to next page
                                    </span>
                                    <ChevronRight />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hidden size-8 lg:flex"
                                    onClick={() => onPageChange(totalPages)}
                                    disabled={totalPages <= pageIndex}
                                >
                                    <span className="sr-only">
                                        Go to last page
                                    </span>
                                    <ChevronsRight />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const inventoryColumns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "name",
        header: "Item name",
        cell: ({ row }) => (
            <span className="font-semibold text-base">{row.original.name}</span>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {formatEnums(row.original.category)}
            </span>
        ),
    },
    {
        accessorKey: "warehouseStock",
        header: () => "Warehouse Stock",
        cell: ({ row }) => {
            const unit = formatEnums(row.original.unit);
            return (
                <div className="font-semibold">
                    {row.original.warehouseStock}{" "}
                    <span className="text-xs text-muted-foreground">
                        {unit}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "houseReservedStock",
        header: () => "House Reserved Stock",
        cell: ({ row }) => {
            const unit = formatEnums(row.original.unit);
            return (
                <div className="font-semibold">
                    {row.original.houseReservedStock}{" "}
                    <span className="text-xs text-muted-foreground">
                        {unit}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "movementType",
        header: "Movement",
        cell: ({ row }) => {
            if (!row.original.movementType) return;
            return (
                <span className="font-semibold text-muted-foreground">
                    {formatEnums(row.original.movementType)}
                </span>
            );
        },
    },
    {
        accessorKey: "movementQuantity",
        header: "Moved Quantity",
        cell: ({ row }) => {
            if (!row.original.movementQuantity) {
                return;
            }
            if (
                row.original.movementType === "OPENING_BALANCE" ||
                row.original.movementType === "PURCHASE"
            ) {
                return (
                    <span className="font-semibold text-green-500">
                        +{row.original.movementQuantity}
                    </span>
                );
            } else if (row.original.movementType === "CONSUMPTION") {
                return (
                    <span className={`font-semibold text-red-500`}>
                        {row.original.movementQuantity}
                    </span>
                );
            } else {
                return (
                    <span className={`font-semibold text-yellow-500`}>
                        -{row.original.movementQuantity}
                    </span>
                );
            }
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
        accessorKey: "lastUpdated",
        header: () => <div className="text-right">Last updated</div>,
        cell: ({ row }) => (
            <div className="text-right text-sm text-muted-foreground">
                {row.original.lastMovement &&
                    formatDate(row.original.lastMovement)}
            </div>
        ),
    },
];
