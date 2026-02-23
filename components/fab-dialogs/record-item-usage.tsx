"use client";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus, RefreshCcw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetData, usePostData } from "@/lib/api-request";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { GetHouses, ItemInventoryForUse } from "@/types";
import {
    RecordItemUsageInput,
    recordItemUsageSchema,
} from "@/schemas/item-usage.schema";
import { Badge } from "../ui/badge";
import { TooltipCreator } from "@/lib/strings";
import { formatQty } from "@/lib/utils";

interface HelperResponse {
    data: GetHouses;
}

export function RecordItemUsage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<RecordItemUsageInput>({
        resolver: zodResolver(recordItemUsageSchema),
        defaultValues: {
            occurredAt: new Date(),
        },
    });

    /* ---------------- Data ---------------- */

    const { data: helperData } = useGetData<HelperResponse>("/get/houses/all");

    const {
        mutate,
        isPending: submitIsPending,
        isSuccess,
        isError,
        error,
    } = usePostData("/create/stock/item/consumption");
    const { data: itemsListRes } = useGetData<{
        data: ItemInventoryForUse[];
    }>("/get/stock/items/to-use");

    const houses = helperData?.data.houses;
    const itemsList = itemsListRes?.data || [];

    function handleFormReset() {
        form.reset({
            houseId: "",
            itemId: "",
            quantity: "",
            occurredAt: new Date(),
        });
    }

    const {
        itemId: selectedItem,
        houseId: selectedHouse,
        quantity: consumeQuantity,
    } = form.watch();

    const selectedItemDetails = itemsList.find(
        (i) => i.item_id === selectedItem
    );

    const selectedHouseReservedStockQuantity = Number(
        selectedItemDetails?.house_reserved_stocks.find(
            (r) => r.houseId === selectedHouse
        )?.quantity ?? 0
    );

    const usedQty = parseFloat((consumeQuantity as string) || "0");

    const warehouseStock = Number(selectedItemDetails?.warehouse_stock ?? 0);
    const reservedStock = selectedHouseReservedStockQuantity;

    const usedFromReserved = Math.min(usedQty, reservedStock);
    const remainingAfterReserved = usedQty - usedFromReserved;

    const usedFromWarehouse = Math.max(
        0,
        Math.min(remainingAfterReserved, warehouseStock)
    );

    const totalAvailable = reservedStock + warehouseStock;
    const remainingTotalStock = totalAvailable - usedQty;

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("Item usage recorded successfully!");
            handleFormReset();
            // setDialogOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to record item usage");
        }

        // console.log()
    }, [isSuccess, isError, error, form]);

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: RecordItemUsageInput) => {
        console.log(values);
        mutate(values);
    };

    const onError = (errors: unknown) => {
        console.log("VALIDATION ERRORS", errors);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-[150px] shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
                    role="menuitem"
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Item Usage</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="w-full"
                    >
                        <DialogHeader>
                            <DialogTitle>Record Item Usage</DialogTitle>
                            <DialogDescription>
                                Record item usage for a specific house
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 md:space-y-4 mt-4">
                            {/* House */}
                            <FormField
                                control={form.control}
                                name="houseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shed</FormLabel>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(val) =>
                                                field.onChange(val || undefined)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select shed" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {houses &&
                                                    houses.map((house) => (
                                                        <SelectItem
                                                            key={house.id}
                                                            value={house.id}
                                                        >
                                                            {house.label}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription></FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="itemId"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Item</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value || ""}
                                                    onValueChange={(val) =>
                                                        field.onChange(
                                                            val || undefined
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itemsList.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.item_id
                                                                    }
                                                                    value={
                                                                        item.item_id
                                                                    }
                                                                >
                                                                    <span className="font-semibold">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>{" "}
                                                                    -
                                                                    <span>
                                                                        {TooltipCreator(
                                                                            {
                                                                                text:
                                                                                    item.company ??
                                                                                    "Unknown Company",
                                                                                size: 24,
                                                                            }
                                                                        )}
                                                                    </span>{" "}
                                                                    -
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2"
                                                                    >
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </Badge>
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    );
                                }}
                            />

                            <div className="bg-muted/50 border border-border rounded-md p-3 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">
                                        Reserved (Priority)
                                    </span>
                                    <span className="font-semibold">
                                        {formatQty(reservedStock)}{" "}
                                        {selectedItemDetails?.unit}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">
                                        Warehouse (Secondary)
                                    </span>
                                    <span className="font-semibold">
                                        {formatQty(warehouseStock)}{" "}
                                        {selectedItemDetails?.unit}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-sm font-medium">
                                        Total Available
                                    </span>
                                    <span className="font-bold">
                                        {formatQty(
                                            reservedStock + warehouseStock
                                        )}{" "}
                                        {selectedItemDetails?.unit}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-4">
                                <div className={`col-span-4`}>
                                    {/* Consume Quantity - Red for Consumption */}
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Used Quantity
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="e.g. 50"
                                                        className="pr-12"
                                                        value={
                                                            (field.value as string) ??
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            let val =
                                                                e.target.value;

                                                            // Prefix 0 if starts with "."
                                                            if (
                                                                val.startsWith(
                                                                    "."
                                                                )
                                                            ) {
                                                                val = `0${val}`;
                                                            }

                                                            // Allow valid decimal typing only
                                                            if (
                                                                /^\d*\.?\d*$/.test(
                                                                    val
                                                                )
                                                            ) {
                                                                field.onChange(
                                                                    val
                                                                ); // ✅ STRING ONLY
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter quantity used
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className={`col-span-3`}>
                                    {/* Unit Display */}
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Unit</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        disabled
                                                        value={
                                                            selectedItemDetails?.unit ??
                                                            "Select Item"
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            {selectedItemDetails?.unit ||
                                                                "Select Item"}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">
                                                                {selectedItemDetails?.unit ??
                                                                    "Select Item"}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            {selectedItemDetails &&
                                typeof consumeQuantity === "string" && (
                                    <div
                                        className={`border rounded-md p-4 space-y-3 ${
                                            remainingTotalStock < 0
                                                ? "bg-red-50 border-red-300"
                                                : "bg-blue-50 border-blue-300"
                                        }`}
                                    >
                                        <div className="text-sm font-semibold text-foreground">
                                            Stock Allocation Breakdown
                                        </div>

                                        {/* Reserved Usage */}
                                        {reservedStock > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Used from Reserved</span>
                                                <span className="font-medium">
                                                    {formatQty(
                                                        usedFromReserved
                                                    )}{" "}
                                                    {selectedItemDetails.unit}
                                                </span>
                                            </div>
                                        )}

                                        {/* Warehouse Usage */}
                                        {usedFromWarehouse > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Used from Warehouse</span>
                                                <span className="font-medium">
                                                    {formatQty(
                                                        usedFromWarehouse
                                                    )}{" "}
                                                    {selectedItemDetails.unit}
                                                </span>
                                            </div>
                                        )}

                                        <div className="border-t pt-2 flex justify-between text-sm">
                                            <span>
                                                Total Remaining After Usage
                                            </span>
                                            <span
                                                className={`font-bold ${
                                                    remainingTotalStock < 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {formatQty(remainingTotalStock)}{" "}
                                                {selectedItemDetails.unit}
                                            </span>
                                        </div>

                                        {reservedStock > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Reserved stock is consumed
                                                first. If usage exceeds reserved
                                                quantity, remaining amount is
                                                deducted from warehouse stock.
                                            </p>
                                        )}

                                        {remainingTotalStock < 0 && (
                                            <p className="text-xs text-red-600 font-medium">
                                                ⚠️ Insufficient total stock.
                                                Reduce usage quantity.
                                            </p>
                                        )}
                                    </div>
                                )}
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            <Button
                                variant={"outline"}
                                onClick={handleFormReset}
                                className="cursor-pointer"
                                type="button"
                            >
                                <RefreshCcw />
                                Reset
                            </Button>
                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={
                                    submitIsPending || remainingTotalStock < 0
                                }
                                className="cursor-pointer"
                            >
                                {submitIsPending ? <Spinner /> : <Save />}

                                {submitIsPending ? "Recording" : "Record Usage"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
