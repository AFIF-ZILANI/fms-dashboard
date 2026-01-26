"use client";

import { useEffect, useState } from "react";

import { Plus, RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useGetData, usePostData } from "@/lib/api-request";
import {
    addWeightRecordSchema,
    AvgWeightFormInput,
} from "@/schemas/weight-record.schema";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "../ui/spinner";
import { GetHouses } from "@/types";

interface HelperResponse {
    data: GetHouses;
}

/* ---------------------------------- */
/* Page */
/* ---------------------------------- */

export function AddWeightRecordDialog() {
    const [dialogOpen, setDialogOpen] = useState(false);

    /* ---------------- Form ---------------- */

    const form = useForm<AvgWeightFormInput>({
        resolver: zodResolver(addWeightRecordSchema),
        defaultValues: {
            occurredAt: new Date(),
        },
    });

    /* ---------------- Data ---------------- */

    const { data: helperData, isFetching: helperIsFetching } =
        useGetData<HelperResponse>("/get/houses");

    const {
        mutate,
        isPending: submitIsPending,
        isSuccess,
        isError,
        error,
    } = usePostData("/create/record/weight");

    const houses = helperData?.data.houses;
    console.log(houses);

    const selectedHouseId = form.watch("houseId");

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("Weight record saved successfully!");
            form.reset();
            form.setValue("houseId", "");
            // setDialogOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to save weight record");
        }
    }, [isSuccess, isError, error, form]);

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: AvgWeightFormInput) => {
        // console.log("Hello");
        // console.log(values)
        mutate(values);
    };

    const onError = (errors: unknown) => {
        console.log("VALIDATION ERRORS", errors);
    };

    /* ---------------- UI ---------------- */

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
                    <span className="text-sm font-medium">Weight Record</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="px-4 mt-1 bg-background">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                        <DialogHeader>
                            <DialogTitle>Weekly Weight Measurement</DialogTitle>
                            <DialogDescription>
                                Enter average weight data collected from sample
                                birds
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 md:space-y-6">
                            {/* House */}
                            <FormField
                                control={form.control}
                                name="houseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>House *</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={helperIsFetching}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a house" />
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

                            <FormField
                                control={form.control}
                                name="avgWeightInGrams"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Average Weight (grams) *
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
                                            Average bird weight in grams
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sample Size */}
                            <FormField
                                control={form.control}
                                name="sampleSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sample Size *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                pattern="[0-9]*"
                                                className="pr-12"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow only digits
                                                    if (/^\d*$/.test(val)) {
                                                        field.onChange(
                                                            val === ""
                                                                ? ""
                                                                : Number(val)
                                                        );
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Number of birds weighed
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tip */}
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                <strong>Tip:</strong> Weigh 50–100 birds
                                randomly from different areas at the same time
                                each week.
                            </div>
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            <Button
                                variant={"outline"}
                                onClick={() => {
                                    form.reset();
                                    form.setValue("houseId", "");
                                }}
                            >
                                <RefreshCcw />
                                Reset
                            </Button>
                            {/* Submit */}
                            <Button type="submit" disabled={submitIsPending}>
                                {submitIsPending ? <Spinner /> : <Save />}

                                {submitIsPending ? "Saving" : "Save Weight"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function formatBatchDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
    });
}
