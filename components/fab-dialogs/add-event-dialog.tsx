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
import { EVENT_UNIT_MAP, GetHouses, HouseEventType } from "@/types";

interface HelperResponse {
    data: GetHouses;
}

export function AddEventDialog() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<HouseEventFormInput>({
        resolver: zodResolver(addHouseEventSchema),
        defaultValues: {
            occurredAt: new Date(),
        },
    });

    /* ---------------- Data ---------------- */

    const { data: helperData } = useGetData<HelperResponse>("/get/houses");

    const {
        mutate,
        isPending: submitIsPending,
        isSuccess,
        isError,
        error,
    } = usePostData("/create/record/event");

    const houses = helperData?.data.houses;
    // console.log(houses);

    const selectedHouseId = form.watch("houseId");
    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("House event saved successfully!");
            form.reset();
            // setDialogOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to save house event");
        }

        // console.log()
    }, [isSuccess, isError, error, form]);

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: HouseEventFormInput) => {
        // console.log(values);
        const normalizedQuantity =
            values.eventType === "FEED"
                ? normalizeQuantity(
                      values.quantity as number,
                      values.unit as "KG" | "BAG"
                  )
                : values.quantity;
        mutate({
            ...values,
            quantity: normalizedQuantity,
            unit: EVENT_UNIT_MAP[values.eventType].canonical,
        });
    };

    const onError = (errors: unknown) => {
        console.log("VALIDATION ERRORS", errors);
    };

    const handleEventTypeChange = (type: HouseEventType) => {
        const config = EVENT_UNIT_MAP[type];

        form.setValue("eventType", type as HouseEventEnum);
        form.setValue("unit", config.canonical as HouseEventUnitEnum);
        form.setValue("quantity", 0);
    };
    const BAG_WEIGHT_KG = 50;

    function normalizeQuantity(quantity: number, unit: "KG" | "BAG"): number {
        if (unit === "BAG") {
            return quantity * BAG_WEIGHT_KG;
        }
        return quantity;
    }

    const selectedEventType = form.watch("eventType");
    const allowedUnits = selectedEventType
        ? EVENT_UNIT_MAP[selectedEventType].uiUnits
        : [];

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
                    <span className="text-sm font-medium">House Event</span>
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
                                        <FormDescription>
                                            {houses && selectedHouseId ? (
                                                <span className="text-xs text-muted-foreground">
                                                    Running batch:{" "}
                                                    {
                                                        houses.find(
                                                            (h) =>
                                                                h.id ===
                                                                selectedHouseId
                                                        )?.runningBatch
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    No house selected
                                                </span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* EventType */}
                            <FormField
                                control={form.control}
                                name="eventType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type</FormLabel>
                                        <Select
                                            value={
                                                field.value
                                                    ? field.value.toString()
                                                    : ""
                                            }
                                            onValueChange={(v) =>
                                                handleEventTypeChange(
                                                    v as HouseEventType
                                                )
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Event Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EventTypeArr.map(
                                                    (event, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            value={event}
                                                        >
                                                            {event}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            House where birds were weighed
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-7 gap-4">
                                <div
                                    className={`${allowedUnits.length > 1 ? "col-span-4" : "col-span-7"}`}
                                >
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

                                {allowedUnits.length > 1 && (
                                    <div className="col-span-3">
                                        {/* Unit */}
                                        <FormField
                                            control={form.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit</FormLabel>
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
                                                            {allowedUnits.map(
                                                                (
                                                                    unit,
                                                                    index
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            unit
                                                                        }
                                                                    >
                                                                        {unit}
                                                                    </SelectItem>
                                                                )
                                                            )}
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
                                )}
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
                                disabled={submitIsPending}
                                className="cursor-pointer"
                            >
                                {submitIsPending ? <Spinner /> : <Save />}

                                {submitIsPending ? "Saving" : "Save Event"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
