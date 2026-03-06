"use client";

import { CalendarIcon, Plus, RefreshCcw, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { useGetData, usePostData } from "@/lib/api-request";
import { toast } from "sonner";
import {
    BatchAllocationInput,
    batchAllocationSchema,
} from "@/schemas/batch.schema";
import { Skeleton } from "../ui/skeleton";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { House } from "@/types";

export function AddBatchAllocationDialog() {
    const { data: runningHouses, isLoading: runningHousesIsLoading } =
        useGetData<{ data: House[] }>("/get/houses/running");
    const { data: destinationHouses, isLoading: destinationHousesIsLoading } =
        useGetData<{ data: { id: string; label: string }[] }>(
            "/get/houses/ready-for-allocation"
        );

    // console.log("[runningHouses] => ", runningHouses);
    const runningHousesData = runningHouses?.data || [];
    const destinationHousesData = destinationHouses?.data || [];

    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<BatchAllocationInput>({
        resolver: zodResolver(batchAllocationSchema),
        defaultValues: {
            toHouseId: "",
            fromHouseId: "",
            date: new Date(),
            allocationType: "FULL",
            quantity: 0,
        },
    });

    const { mutate, isPending: submitIsPending } = usePostData(
        "/create/batch/allocation"
    );

    const onSubmit = (values: BatchAllocationInput) => {
        mutate(values, {
            onSuccess: () => {
                toast.success("Batch allocated successfully!");
                form.reset();
                setDialogOpen(false);
            },
            onError: (error) => {
                toast.error(error.message || "Failed to allocate batch");
            },
        });
    };

    const onError = (error: unknown) => {
        console.error(error);
    };

    const selectedHouseId = useWatch({
        control: form.control,
        name: "fromHouseId",
    });
    const selectedHouse =
        !runningHousesIsLoading && runningHousesData.length
            ? runningHousesData.find((house) => house.id === selectedHouseId)
            : null;

    // console.log("runningHousesData", runningHousesData);
    // console.log("selectedHouseId", selectedHouseId);
    // console.log("selectedHouse", selectedHouse);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-[150px] shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-background/95 backdrop-blur"
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Allocate Batch</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="px-4 mt-1 bg-background max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Allocate Batch</DialogTitle>
                            <DialogDescription>
                                Transfer quantity between houses
                            </DialogDescription>
                        </DialogHeader>

                        {/* From House */}
                        <FormField
                            control={form.control}
                            name="fromHouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Source House</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select from house" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {runningHousesData.length &&
                                                !runningHousesIsLoading ? (
                                                    runningHousesData.map(
                                                        (house) => (
                                                            <SelectItem
                                                                key={house.id}
                                                                value={house.id}
                                                            >
                                                                {house.label}
                                                            </SelectItem>
                                                        )
                                                    )
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-[30px] w-full" />
                                                        <Skeleton className="h-[30px] w-full" />
                                                        <Skeleton className="h-[30px] w-full" />
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    {selectedHouse ? (
                                        <span className="text-xs text-muted-foreground">
                                            Running batch:{" "}
                                            {selectedHouse.runningBatchId}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            No house selected
                                        </span>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* To House */}
                        <FormField
                            control={form.control}
                            name="toHouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Select Destination House
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select from house" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinationHousesData.length &&
                                                !destinationHousesIsLoading ? (
                                                    destinationHousesData.map(
                                                        (house) => (
                                                            <SelectItem
                                                                key={house.id}
                                                                value={house.id}
                                                            >
                                                                {house.label}
                                                            </SelectItem>
                                                        )
                                                    )
                                                ) : (
                                                    <div className="space-y-2 ">
                                                        <Skeleton className="h-[30px] w-full" />
                                                        <Skeleton className="h-[30px] w-full" />
                                                        <Skeleton className="h-[30px] w-full" />
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allocation Date</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="pl-3 text-left font-normal bg-transparent"
                                                    >
                                                        {field.value instanceof
                                                        Date
                                                            ? format(
                                                                  field.value,
                                                                  "PPP"
                                                              )
                                                            : "Pick a date"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                align="start"
                                                className="p-0"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        field.value instanceof
                                                        Date
                                                            ? field.value
                                                            : new Date()
                                                    }
                                                    onSelect={field.onChange}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Quantity */}
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                // allow empty (user can delete)
                                                if (val === "") {
                                                    field.onChange(undefined);
                                                    return;
                                                }

                                                // allow ONLY integers (digits only)
                                                if (/^\d+$/.test(val)) {
                                                    field.onChange(Number(val));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button type="submit" disabled={submitIsPending}>
                                {submitIsPending ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {submitIsPending ? "Allocating..." : "Allocate"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
