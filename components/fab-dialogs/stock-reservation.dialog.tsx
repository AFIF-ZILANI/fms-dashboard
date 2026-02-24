"use client";
import { useState } from "react";
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
import { useForm, useWatch } from "react-hook-form";
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
    addStockReservationSchema,
    AddStockReservationInput,
} from "@/schemas/item.schema";
import { Badge } from "../ui/badge";
import { TooltipCreator } from "@/lib/strings";

interface HelperResponse {
    data: GetHouses;
}

export function StockReservationDialog() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<AddStockReservationInput>({
        resolver: zodResolver(addStockReservationSchema),
        defaultValues: {
            occurredAt: new Date(),
        },
    });

    /* ---------------- Data ---------------- */

    const { data: helperData } = useGetData<HelperResponse>("/get/houses/all");

    const { mutate, isPending: submitIsPending } = usePostData(
        "/create/stock/item/reservation"
    );
    const { data: itemsListRes } = useGetData<{
        data: ItemInventoryForUse[];
    }>("/get/stock/items/to-use");

    const houses = helperData?.data.houses;
    const itemsList = itemsListRes?.data || [];
    console.log(itemsListRes);

    function handleFormReset() {
        form.reset({
            houseId: "",
            itemId: "",
            quantity: "",
            occurredAt: new Date(),
        });
    }

    const selectedItem = useWatch({
        control: form.control,
        name: "itemId",
    });
    const selectedHouse = useWatch({
        control: form.control,
        name: "houseId",
    });
    const allocatedQuantity = useWatch({
        control: form.control,
        name: "quantity",
    });

    const selectedItemDetails = itemsList.find(
        (i) => i.item_id === selectedItem
    );

    // Calculate remaining stock
    const warehouseStock = Number(selectedItemDetails?.warehouse_stock ?? 0);

    const currentHouseReserved = Number(
        selectedItemDetails?.house_reserved_stocks.find(
            (r) => r.houseId === selectedHouse
        )?.quantity ?? 0
    );

    const allocateQty = parseFloat((allocatedQuantity as string) || "0");

    // After allocation
    const warehouseAfterAllocation = warehouseStock - allocateQty;
    const houseReservedAfterAllocation = currentHouseReserved + allocateQty;

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: AddStockReservationInput) => {
        console.log(values);
        mutate(values, {
            onSuccess: () => {
                toast.success("Stock reserved successfully!");
                handleFormReset();
            },
            onError: (error) => {
                toast.error(
                    error.message || "Failed to save stock reservation"
                );
            },
        });
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
                    <span className="text-sm font-medium">Allocate Stock</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="w-full"
                    >
                        <DialogHeader>
                            <DialogTitle>Allocate Stock Item</DialogTitle>
                            <DialogDescription>
                                Allocate stock for a specific house
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

                            {/* Stock Available Display */}
                            <div className="bg-muted/50 border border-border rounded-md p-4 space-y-3">
                                <div className="text-sm font-semibold">
                                    Current Stock Status
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Warehouse Stock</span>
                                    <span className="font-medium">
                                        {warehouseStock}{" "}
                                        {selectedItemDetails?.unit}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>
                                        Current Allocation for This Shed
                                    </span>
                                    <span className="font-medium">
                                        {currentHouseReserved}{" "}
                                        {selectedItemDetails?.unit}
                                    </span>
                                </div>

                                <div className="border-t pt-2 text-xs text-muted-foreground">
                                    Allocation moves stock from warehouse to
                                    shed reservation.
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
                                                    Allocation Quantity
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
                                                    Enter quantity to be
                                                    allocated
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
                            {/* Remaining Stock Display */}
                            {selectedItemDetails &&
                                typeof allocatedQuantity === "string" &&
                                allocateQty > 0 && (
                                    <div
                                        className={`border rounded-md p-4 space-y-3 ${
                                            warehouseAfterAllocation < 0
                                                ? "bg-red-50 border-red-300"
                                                : "bg-blue-50 border-blue-300"
                                        }`}
                                    >
                                        <div className="text-sm font-semibold">
                                            After Allocation
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span>Warehouse Remaining</span>
                                            <span
                                                className={`font-bold ${
                                                    warehouseAfterAllocation < 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {warehouseAfterAllocation}{" "}
                                                {selectedItemDetails.unit}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span>Shed Reserved Total</span>
                                            <span className="font-bold text-blue-600">
                                                {houseReservedAfterAllocation}{" "}
                                                {selectedItemDetails.unit}
                                            </span>
                                        </div>

                                        {warehouseAfterAllocation < 0 && (
                                            <p className="text-xs text-red-600 font-medium">
                                                ⚠️ Insufficient warehouse stock.
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
                                    submitIsPending ||
                                    allocateQty <= 0 ||
                                    warehouseAfterAllocation < 0
                                }
                                className="cursor-pointer"
                            >
                                {submitIsPending ? <Spinner /> : <Save />}

                                {submitIsPending
                                    ? "Recording"
                                    : "Record Allocation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
