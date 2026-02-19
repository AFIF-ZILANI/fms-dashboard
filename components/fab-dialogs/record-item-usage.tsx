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
import { Plus, Save } from "lucide-react";
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
import { GetHouses } from "@/types";
import {
    RecordItemUsageInput,
    recordItemUsageSchema,
} from "@/schemas/item-usage.schema";
import { Item } from "@/types/purchase";
import { Badge } from "../ui/badge";

interface HelperResponse {
    data: GetHouses;
}

export function RecordItemUsage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentStock, setCurrentStock] = useState<number>(0);
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
        data: Item[];
    }>("/get/stock/items/all");

    const houses = helperData?.data.houses;
    const itemsList = itemsListRes?.data || [];
    console.log(itemsListRes);

    const selectedHouseId = form.watch("houseId");
    const selectedItem = form.watch("itemId");
    const consumeQuantity = form.watch("quantity");
    const selectedItemDetails = itemsList.find((i) => i.id === selectedItem);

    // Update current stock when item is selected
    useEffect(() => {
        if (selectedItem) {
            fetch(`/api/get/stock/items/one?id=${selectedItem}`).then(
                async (res) => {
                    const response = await res.json();
                    setCurrentStock(response.data ?? 0);
                }
            );
        }
    }, [selectedItem]);

    // Calculate remaining stock
    const remainingStock =
        currentStock - (parseFloat(consumeQuantity as string) || 0);
    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("Item usage recorded successfully!");
            form.reset();
            setCurrentStock(0);
            // setDialogOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to save house event");
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
                                        <FormLabel>House</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select house" />
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
                                                    onValueChange={
                                                        field.onChange
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
                                                                        item.id
                                                                    }
                                                                    value={
                                                                        item.id
                                                                    }
                                                                >
                                                                    <span className="font-semibold">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>{" "}
                                                                    -{" "}
                                                                    <span>
                                                                        {item.company ||
                                                                            "Unknown"}
                                                                    </span>
                                                                    -
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2"
                                                                    >
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </Badge>{" "}
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
                            {selectedItemDetails && (
                                <div className="bg-muted/50 border border-border rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">
                                            Available Stock
                                        </span>
                                        <span className="text-lg font-semibold text-foreground">
                                            {currentStock}{" "}
                                            <span className="text-sm text-muted-foreground">
                                                {selectedItemDetails.unit ||
                                                    "Units"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            )}

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
                            {/* Remaining Stock Display */}
                            {selectedItemDetails &&
                                typeof consumeQuantity === "string" && (
                                    <div
                                        className={`border rounded-md p-3 ${
                                            remainingStock < 0
                                                ? "bg-red-50 border-red-300"
                                                : "bg-green-50 border-green-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">
                                                Remaining Stock
                                            </span>
                                            <span
                                                className={`text-lg font-bold ${
                                                    remainingStock < 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {remainingStock.toFixed(2)}{" "}
                                                <span className="text-sm text-muted-foreground font-normal">
                                                    {selectedItemDetails.unit ||
                                                        "Units"}
                                                </span>
                                            </span>
                                        </div>
                                        {remainingStock < 0 && (
                                            <p className="text-xs text-red-600 mt-2 font-medium">
                                                ⚠️ Insufficient stock -
                                                consumption exceeds available
                                                quantity
                                            </p>
                                        )}
                                    </div>
                                )}
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            {/* <Button
                                variant={"outline"}
                                onClick={() => {
                                    form.reset();
                                    setCurrentStock(0);
                                }}
                                className="cursor-pointer"
                                type="button"
                            >
                                <RefreshCcw />
                                Reset
                            </Button> */}
                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={submitIsPending || remainingStock < 0}
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
