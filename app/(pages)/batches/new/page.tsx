"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, CalendarIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { addBatchSchema, type AddBatchInput } from "@/schemas/batch.schema";
import { BirdBreeds } from "@/app/generated/prisma/enums";
import { useGetData, usePostData } from "@/lib/api-request";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export type SupplierOption = {
    id: string;
    name: string;
    company?: string;
};
interface SuppliersResponse {
    data: SupplierOption[];
}

export default function AddBatchPage() {
    const router = useRouter();
    const { mutate, isSuccess, isPending, isError, error } =
        usePostData("/create/batch/new");
    const {
        data,
        // isError: isGetSupplierError,
        // isFetched,
        isFetching,
    } = useGetData("/suppliers/get-all-suppliers?category=CHICKS");

    const form = useForm<AddBatchInput>({
        resolver: zodResolver(addBatchSchema),
        defaultValues: {
            date: new Date(),
            initialQuantity: 0,
            suppliers: [
                {
                    id: "",
                    quantity: 0,
                    deliveryDate: new Date(),
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "suppliers",
    });

    const suppliersList: SupplierOption[] = (data as SuppliersResponse)?.data;
    console.log(suppliersList);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Batch Created Successfully");
            form.reset();
            router.push("/batches");
        }

        if (isError) {
            toast.error(error.message);
        }
    }, [isError, isSuccess, isPending, error, form, router]);

    const onSubmit = (data: AddBatchInput) => {
        mutate({
            ...data,
        });
    };

    const onError = (error: unknown) => {
        console.error("Error submitting batch:", error);
        toast.error("Failed to create batch");
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 mb-16">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-balance">
                    Create New Batch
                </h1>
                <p className="text-muted-foreground text-pretty">
                    Start a new poultry batch by entering the initial details
                    and supplier information. You can add multiple suppliers for
                    a single batch.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, onError)}
                    className="space-y-6"
                >
                    {/* ---------------- Batch Info Card ---------------- */}
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">
                                Batch Information
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Set the starting parameters for your new batch
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
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
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="breed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Breed</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select breed" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(
                                                        BirdBreeds
                                                    ).map((val, i) => (
                                                        <SelectItem
                                                            value={val}
                                                            key={i}
                                                        >
                                                            {val}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="initChicksAvgWT"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>
                                                Initial Average Weight
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
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
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                        grams
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ---------------- Suppliers ---------------- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold">
                                    Supplier Details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Add one or more suppliers providing chicks
                                    for this batch
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    append({
                                        id: "",
                                        quantity: 0,
                                        unitPrice: 0,
                                        deliveryDate: new Date(),
                                    })
                                }
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Supplier
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <Card key={field.id}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            Supplier {index + 1}
                                        </CardTitle>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name={`suppliers.${index}.id`}
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>
                                                        Supplier
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select supplier" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isFetching ? (
                                                                <div>
                                                                    Fetching
                                                                    Suppliers...
                                                                </div>
                                                            ) : (
                                                                suppliersList.map(
                                                                    (s) => (
                                                                        <SelectItem
                                                                            key={
                                                                                s.id
                                                                            }
                                                                            value={
                                                                                s.id
                                                                            }
                                                                            className="space-x-5"
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    s.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-muted-foreground">
                                                                                {s.company &&
                                                                                    `(${s.company})`}
                                                                            </span>
                                                                        </SelectItem>
                                                                    )
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`suppliers.${index}.deliveryDate`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>
                                                        Delivery Date
                                                    </FormLabel>
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
                                                                onSelect={
                                                                    field.onChange
                                                                }
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`suppliers.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Quantity
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="0"
                                                            pattern="[0-9]*"
                                                            {...field}
                                                            value={
                                                                field.value ||
                                                                ""
                                                            }
                                                            onChange={(e) => {
                                                                const val =
                                                                    e.target
                                                                        .value;
                                                                // Allow only digits
                                                                if (
                                                                    /^\d*$/.test(
                                                                        val
                                                                    )
                                                                ) {
                                                                    field.onChange(
                                                                        val ===
                                                                            ""
                                                                            ? ""
                                                                            : Number(
                                                                                  val
                                                                              )
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`suppliers.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Price per Chick
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                                ৳
                                                            </span>
                                                            <Input
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder="e.g. 100"
                                                                className="pr-12 pl-6"
                                                                value={
                                                                    (field.value as string) ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    let val =
                                                                        e.target
                                                                            .value;

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
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ---------------- Submit Button ---------------- */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1 md:flex-none md:min-w-48 cursor-pointer"
                        >
                            {isPending ? (
                                <>
                                    <Spinner /> Creating batch...
                                </>
                            ) : (
                                "Create Batch"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => form.reset()}
                        >
                            Reset Form
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
