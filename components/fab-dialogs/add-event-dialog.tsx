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
import { LeftoverFeed } from "@/types/inventory/type";
import { formatQty } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/dateUtils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface HelperResponse {
    data: GetHouses;
}

export function AddEventDialog() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [usePreviousLeftover, setUsePreviousLeftover] = useState(true);
    const form = useForm<HouseEventFormInput>({
        resolver: zodResolver(addHouseEventSchema),
        defaultValues: {
            occurredAt: new Date(),
            leftOverFeedQty: "",
            usedLeftOverFeed: false,
            quantity: "",
        },
    });

    /* ---------------- Data ---------------- */

    const { data: helperData } = useGetData<HelperResponse>(
        "/get/houses/running"
    );
    const { data: leftoverFeedData } = useGetData<{ data: LeftoverFeed[] }>(
        "/get/leftover/feed"
    );

    const { mutate, isPending: submitIsPending } = usePostData(
        "/create/record/event"
    );

    const houses = helperData?.data.houses;
    const leftover = leftoverFeedData?.data;

    const selectedHouseId = useWatch({
        control: form.control,
        name: "houseId",
    });

    const feedAddedRaw = useWatch({
        control: form.control,
        name: "quantity",
    });
    const unit = useWatch({
        control: form.control,
        name: "unit",
    });

    function handleFormReset() {
        form.reset({
            houseId: "",
            eventType: undefined,
            quantity: "",
            leftOverFeedQty: "",
            usedLeftOverFeed: false,
            occurredAt: new Date(),
        });
    }

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: HouseEventFormInput) => {
        // console.log("VALUES", values);
        mutate(
            {
                ...values,
                usedLeftOverFeed: usePreviousLeftover,
            },
            {
                onSuccess: () => {
                    toast.success("House event saved successfully!");
                    handleFormReset();
                    // setDialogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to save house event");
                },
            }
        );
    };

    const onError = (errors: unknown) => {
        console.log("VALIDATION ERRORS", errors);
    };

    const handleEventTypeChange = (type: HouseEventType) => {
        const config = EVENT_UNIT_MAP[type];

        form.setValue("eventType", type as HouseEventEnum);
        form.setValue("unit", config.canonical as HouseEventUnitEnum);
        form.setValue("quantity", "");
        form.setValue("leftOverFeedQty", "");
    };

    const BAG_WEIGHT_KG = 50;

    function normalizeQuantity(quantity: number, unit: "KG" | "BAG"): number {
        if (unit === "BAG") {
            return quantity * BAG_WEIGHT_KG;
        }
        return quantity;
    }

    const selectedEventType = useWatch({
        control: form.control,
        name: "eventType",
    });

    const allowedUnits = selectedEventType
        ? EVENT_UNIT_MAP[selectedEventType].uiUnits
        : [];

    const leftoverThisHouse = leftover?.find(
        (house) => house.house_id === selectedHouseId
    );

    const rawPreviousLeftover = Number(
        leftoverThisHouse?.quantity_remaining || 0
    );

    const previousLeftover = usePreviousLeftover ? rawPreviousLeftover : 0;
    const feedAdded =
        selectedEventType === "FEED"
            ? normalizeQuantity(
                  Number(feedAddedRaw || 0),
                  form.getValues("unit") as "KG" | "BAG"
              )
            : 0;

    const calculatedConsumption = previousLeftover + feedAdded;

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
                                            value={field.value || ""}
                                            onValueChange={(val) =>
                                                field.onChange(val || undefined)
                                            }
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
                                    className={`${allowedUnits.length > 1 ? "col-span-4" : "col-span-7"} relative`}
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
                                                        placeholder="e.g. 50"
                                                        className="pr-12"
                                                        value={
                                                            (field.value as string) ??
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            let val =
                                                                e.target.value;

                                                            // If current value is "0" and user types a number,
                                                            // replace instead of append
                                                            if (
                                                                field.value ===
                                                                    "0" &&
                                                                /^\d$/.test(val)
                                                            ) {
                                                                field.onChange(
                                                                    val
                                                                );
                                                                return;
                                                            }

                                                            if (
                                                                val.startsWith(
                                                                    "."
                                                                )
                                                            ) {
                                                                val = `0${val}`;
                                                            }

                                                            if (
                                                                /^\d*\.?\d*$/.test(
                                                                    val
                                                                )
                                                            ) {
                                                                field.onChange(
                                                                    val
                                                                );
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
                                    {selectedEventType !== "FEED" && (
                                        <span className="absolute right-4 top-10 -translate-y-1/2 text-muted-foreground">
                                            {unit}
                                        </span>
                                    )}
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

                            {selectedEventType === "FEED" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm">
                                        <div className="flex flex-col">
                                            <div className="font-medium flex items-center gap-2">
                                                <span>Previous Leftover</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(
                                                        String(
                                                            leftoverThisHouse?.updated_at
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatQty(rawPreviousLeftover)}{" "}
                                                KG
                                            </span>
                                        </div>

                                        <Label className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                checked={usePreviousLeftover}
                                                onCheckedChange={(e) =>
                                                    setUsePreviousLeftover(
                                                        e.valueOf()
                                                            ? true
                                                            : false
                                                    )
                                                }
                                            />
                                            <span>Fully Used</span>
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <FormField
                                            control={form.control}
                                            name="leftOverFeedQty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Current Leftover After
                                                        Feeding
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
                                                                    e.target
                                                                        .value;

                                                                // If current value is "0" and user types a number,
                                                                // replace instead of append
                                                                if (
                                                                    field.value ===
                                                                        "0" &&
                                                                    /^\d$/.test(
                                                                        val
                                                                    )
                                                                ) {
                                                                    field.onChange(
                                                                        val
                                                                    );
                                                                    return;
                                                                }

                                                                if (
                                                                    val.startsWith(
                                                                        "."
                                                                    )
                                                                ) {
                                                                    val = `0${val}`;
                                                                }

                                                                if (
                                                                    /^\d*\.?\d*$/.test(
                                                                        val
                                                                    )
                                                                ) {
                                                                    field.onChange(
                                                                        val
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Measure and enter
                                                        remaining feed in house
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <span className="absolute right-4 top-10 -translate-y-1/2 text-muted-foreground">
                                            KG
                                        </span>
                                    </div>

                                    {/* Calculated Consumption Display */}
                                    <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span>Previous Leftover</span>

                                            <span>
                                                {formatQty(previousLeftover)} KG
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Feed Added</span>
                                            <span>
                                                {formatQty(feedAdded)} KG
                                            </span>
                                        </div>

                                        <div className="border-t pt-2 flex justify-between font-medium">
                                            <span>Calculated Consumption</span>
                                            <span
                                                className={
                                                    calculatedConsumption < 0
                                                        ? "text-destructive"
                                                        : ""
                                                }
                                            >
                                                {calculatedConsumption > 0
                                                    ? formatQty(
                                                          calculatedConsumption
                                                      )
                                                    : 0}{" "}
                                                KG
                                            </span>
                                        </div>

                                        {calculatedConsumption < 0 && (
                                            <p className="text-xs text-destructive">
                                                Invalid input: leftover exceeds
                                                total available feed.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tip */}
                            {/* <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                <strong>Tip:</strong> Record events at the time
                                they occur. Never merge multiple days into one
                                entry, and always confirm the correct batch,
                                house, unit, and quantity before saving.
                            </div> */}
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            <Button
                                variant={"outline"}
                                onClick={handleFormReset}
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
