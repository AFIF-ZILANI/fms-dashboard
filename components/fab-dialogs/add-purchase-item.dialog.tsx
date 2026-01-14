"use client";
import { use, useEffect, useState } from "react";
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
import {
    addHouseEventSchema,
    HouseEventFormInput,
} from "@/schemas/event.schema";
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
import { EventTypeArr, HouseEventEnum, HouseEventUnitEnum } from "@/types/enum";
import { EVENT_UNIT_MAP, HouseEventType } from "@/types";
import { Item } from "@/types/purchase";
import {
    PurchaseItemInput,
    purchaseItemSchema,
} from "@/schemas/purchase-items.schema";
import { ResourceCategories, Units } from "@/app/generated/prisma/enums";

interface HelperResponse {
    data: {
        batches: { id: string; label: string }[];
        houses: { id: number; label: string }[];
    };
}

export function AddEventDialog({ items }: { items: Item[] }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<PurchaseItemInput>({
        resolver: zodResolver(purchaseItemSchema),
    });

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: PurchaseItemInput) => {
        console.log(values);
    };

    const onError = (errors: unknown) => {
        console.log("VALIDATION ERRORS", errors);
    };

    const watchItem = form.watch("itemId");
    const selectedItem = items.find((i) => i.id === watchItem);

    useEffect(() => {
        if (selectedItem) {
            form.setValue("unit", selectedItem.unit as Units);
        }
    }, [selectedItem, form]);

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
                    <span className="text-sm font-medium">Item</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="w-full"
                    >
                        <DialogHeader>
                            <DialogTitle>Record House Event</DialogTitle>
                            <DialogDescription>
                                Log an operational or measurement event for a
                                specific batch and house
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 md:space-y-4">
                            {/* Batch */}
                            <FormField
                                control={form.control}
                                name="itemId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item *</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select batch" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {items.map((item) => (
                                                    <SelectItem
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {`item.name} -- (${item.company})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the item involved in this
                                            event
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unitPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="e.g. 100"
                                                className="pr-12"
                                                value={
                                                    (field.value as string) ??
                                                    ""
                                                }
                                                onChange={(e) => {
                                                    let val = e.target.value;

                                                    // Prefix 0 if starts with "."
                                                    if (val.startsWith(".")) {
                                                        val = `0${val}`;
                                                    }

                                                    // Allow valid decimal typing only
                                                    if (
                                                        /^\d*\.?\d*$/.test(val)
                                                    ) {
                                                        field.onChange(val); // ✅ STRING ONLY
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the unit price for the item
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-7 gap-4">
                                <div>
                                    {/* Event Quantity */}
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Event Quantity
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="e.g. 100"
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
                                                    Enter the quantity related
                                                    to the selected event
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-3">
                                    {/* Unit */}
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit *</FormLabel>
                                                <Select
                                                    value={
                                                        field.value
                                                            ? field.value.toString()
                                                            : ""
                                                    }
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value={
                                                                selectedItem?.unit ||
                                                                ""
                                                            }
                                                        >
                                                            {selectedItem?.unit ||
                                                                "N/A"}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Quantity Unit
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                <strong>Tip:</strong> Record events at the time
                                they occur. Never merge multiple days into one
                                entry, and always confirm the correct batch,
                                house, unit, and quantity before saving.
                            </div>
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            <Button
                                variant={"outline"}
                                onClick={() => form.reset()}
                                className="cursor-pointer"
                            >
                                <RefreshCcw />
                                Reset
                            </Button>
                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="cursor-pointer"
                            >
                                {form.formState.isSubmitting ? (
                                    <Spinner />
                                ) : (
                                    <Save />
                                )}

                                {form.formState.isSubmitting
                                    ? "Adding..."
                                    : "Add Item"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
