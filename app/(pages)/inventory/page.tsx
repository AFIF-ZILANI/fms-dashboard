"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InventoryTable } from "@/components/inventory/overview/desktop-items-table";
import { InventoryMobileList } from "@/components/inventory/overview/mobile-items-list";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { InventoryKPIHeader } from "@/components/inventory/overview/header-kpi";
import { NeedsAttention } from "@/components/inventory/overview/needs-attention";
import {
    AttentionItem,
    InventoryItem,
    OverviewKPIProps,
    VALID_SORT_FIELDS,
    VALID_SORT_ORDERS,
    VALID_STATUSES,
    ValidSortField,
    ValidSortOrder,
    ValidStatus,
} from "@/types/inventory/type";
import { useGetData } from "@/lib/api-request";
import { ResourceCategories } from "@/app/generated/prisma/enums";
import { getStatusBadge } from "@/lib/utils";
import { formatEnums } from "@/lib/strings";

interface InventoryItemsRes {
    data: {
        items: InventoryItem[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export default function Page() {
    const router = useRouter();
    const isMobile = useIsMobile();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ValidStatus | "all">(
        "all"
    );
    const [categoryFilter, setCategoryFilter] = useState<
        ResourceCategories | "all"
    >("all");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState<ValidSortField>("name");
    const [sortOrder, setSortOrder] = useState<ValidSortOrder>("asc");

    // Filter data based on search and
    const {
        refetch: refetchItems,
        data: itemsDataRes,
        isFetching: isFetchingItems,
    } = useGetData<InventoryItemsRes>(
        `/get/stock/items?limit=${pageSize}&page=${pageIndex}&category=${categoryFilter}&status=${statusFilter}&sortOrder=${sortOrder}${sortField ? `&sortBy=${sortField}` : ""}${search ? `&search=${search}` : ""}`
    );
    const { data: attentionDataRes, isLoading: isAttentionDataLoading } =
        useGetData<{ data: { items: AttentionItem[] } }>(
            "/get/stock/items/attention"
        );

    const { data: kpiDataRes, isLoading: kpiDataIsLoading } = useGetData<{
        data: OverviewKPIProps;
    }>("/get/stock/items/overview-kpi");
    const data = itemsDataRes?.data;
    const items = data?.items ?? [];
    let kpiData: OverviewKPIProps = kpiDataRes
        ? kpiDataRes.data
        : {
              outOfStock: 0,
              lowStock: 0,
              totalItems: 0,
              movementsToday: 0,
          };

    const criticalItems = attentionDataRes?.data.items ?? [];
    console.log(data);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPageIndex(1);
    }, []);

    const handleStatusChange = useCallback((value: ValidStatus) => {
        setStatusFilter(value);
        setPageIndex(1);
    }, []);

    const handleCategoryChange = useCallback((value: ResourceCategories) => {
        setCategoryFilter(value);
        setPageIndex(1);
    }, []);

    const handleSortOrderChange = useCallback((value: ValidSortOrder) => {
        setSortOrder(value);
        setPageIndex(1);
    }, []);
    const handleSortByChange = useCallback((value: ValidSortField) => {
        setSortField(value);
        setPageIndex(1);
    }, []);

    const handleItemClick = (itemId: string) => {
        router.push(`/inventory/items/${itemId}`);
    };

    useEffect(() => {
        if (pageIndex && pageSize) {
            refetchItems();
        }
    }, [
        refetchItems,
        pageIndex,
        pageSize,
        categoryFilter,
        sortOrder,
        sortField,
    ]);

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
                Inventory Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
                Manage and track all farm inventory items
            </p>

            <InventoryKPIHeader
                data={{ ...kpiData }}
                isLoading={kpiDataIsLoading}
            />
            <NeedsAttention
                items={criticalItems}
                isLoading={isAttentionDataLoading}
            />
            {/* Inventory Table Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                    All Items
                </h2>

                {/* Search and Filters */}
                <Card className="p-4 sm:p-6 mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filters - Mobile Stack, Desktop Row */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                value={statusFilter}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    {VALID_STATUSES.map((val) => (
                                        <SelectItem key={val} value={val}>
                                            {getStatusBadge(val)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={categoryFilter}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    {Object.values(ResourceCategories).map(
                                        (cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {formatEnums(cat)}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortOrder}
                                onValueChange={handleSortOrderChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Sort Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VALID_SORT_ORDERS.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortField}
                                onValueChange={handleSortByChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VALID_SORT_FIELDS.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Desktop Table View */}
                {!isMobile && (
                    <InventoryTable
                        data={items}
                        isFetching={isFetchingItems}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        totalPages={data?.meta.totalPages ?? 0}
                        totalCount={data?.meta.total ?? 0}
                        onPageChange={setPageIndex}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPageIndex(0);
                        }}
                        onItemClick={handleItemClick}
                    />
                )}

                {/* Mobile Card View */}
                {isMobile && (
                    <InventoryMobileList
                        data={items}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        isFetching={isFetchingItems}
                        totalPages={data?.meta.totalPages ?? 0}
                        totalCount={data?.meta.total ?? 0}
                        onPageChange={setPageIndex}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPageIndex(1);
                        }}
                        onItemClick={handleItemClick}
                    />
                )}
            </div>
        </div>
    );
}
