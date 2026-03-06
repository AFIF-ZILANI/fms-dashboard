"use client";

import { format } from "date-fns";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, CalendarIcon, Plus, Package, Home, Truck } from "lucide-react";

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
import Image from "next/image";

interface InstrumentsResponse {
    id: string;
    label: string;
    type: PaymentMethod;
}

import { addBatchSchema, type AddBatchInput } from "@/schemas/batch.schema";
import {
    BirdBreeds,
    PaymentMethod,
    PaymentStatus,
    UserRole,
} from "@/app/generated/prisma/enums";
import { useGetData, usePostData } from "@/lib/api-request";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { InventoryItem } from "@/types/inventory/type";
import { ActorSelectAsync } from "@/components/actor-search-select";
import { formatEnums } from "@/lib/strings";
import { useEffect, useState } from "react";
import React from "react";

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
    const { mutate, isPending } = usePostData("/create/batch/new");
    const { data } = useGetData("/suppliers/get-all-suppliers?category=CHICKS");
    const { data: feedData } = useGetData(
        "/get/stock/items?limit=10&page=1&category=FEED&status=all&sortOrder=asc&sortBy=name"
    );

    console.log("feedData", feedData);
    const { data: allocationHouses, isLoading: allocationHousesIsLoading } =
        useGetData<{ data: { id: string; label: string }[] }>(
            "/get/houses/ready-for-allocation"
        );
    const { data: userInstrumentsRes } = useGetData<{
        data: InstrumentsResponse[];
    }>(`/get/payments/instruments/user?type=${UserRole.ADMIN}`);

    const userInstruments = userInstrumentsRes?.data || [];
    console.log(userInstrumentsRes);
    const [supplierInstruments, setSupplierInstruments] = useState<
        InstrumentsResponse[]
    >([]);

    const form = useForm<AddBatchInput>({
        resolver: zodResolver(addBatchSchema),
        defaultValues: {
            date: new Date(),
            initialQuantity: 0,
            initChicksAvgWT: "",
            payment: {
                paymentDate: new Date(),
            },
        },
    });

    const supplierId = useWatch({
        control: form.control,
        name: "supplierId",
    });

    useEffect(() => {
        if (!supplierId) return;

        fetch(
            `/api/get/payments/instruments/user?id=${supplierId}&type=${UserRole.SUPPLIER}`
        )
            .then((res) => res.json())
            .then((json) => {
                setSupplierInstruments(
                    json.data?.map((inst: InstrumentsResponse) => ({
                        id: inst.id,
                        label: inst.label,
                        type: inst.type,
                    })) || []
                );
            });

        const fromInstrumentId = form.getValues("payment.fromInstrumentId");
        if (!fromInstrumentId) {
            form.setValue("payment.fromInstrumentId", supplierId);
        }
    }, [supplierId, form]);

    const {
        fields: allocationFields,
        append: allocationAppend,
        remove: allocationRemove,
    } = useFieldArray({
        control: form.control,
        name: "allocation",
    });

    const suppliersList: SupplierOption[] =
        (data as SuppliersResponse)?.data ?? [];
    const feedList: InventoryItem[] =
        (feedData as { data: { items: InventoryItem[] } })?.data?.items ?? [];
    const housesList: { id: string; label: string }[] =
        (allocationHouses as { data: { id: string; label: string }[] })?.data ??
        [];
    console.log(feedList);
    console.log(feedData);
    console.log(suppliersList);
    console.log(housesList);

    const onSubmit = (data: AddBatchInput) => {
        mutate(
            {
                ...data,
            },
            {
                onSuccess: () => {
                    toast.success("Batch Created Successfully");
                    form.reset();
                    router.push("/batches");
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            }
        );
    };

    const onError = (error: unknown) => {
        console.error("Error submitting batch:", error);
        toast.error("Failed to create batch");
    };

    const paymentStatus = useWatch({
        control: form.control,
        name: `paymentStatus`,
    });

    const paymentMethod = useWatch({
        control: form.control,
        name: "payment.method",
    });

    const unitPrice = useWatch({
        control: form.control,
        name: "unitPrice",
    });

    const initialQuantity = useWatch({
        control: form.control,
        name: "initialQuantity",
    });

    const filteredUserInstruments = userInstruments?.filter(
        (i) => i.type === paymentMethod
    );

    const filteredSupplierInstruments = supplierInstruments?.filter(
        (i) => i.type === paymentMethod
    );

    useEffect(() => {
        if (unitPrice && initialQuantity) {
            form.setValue(
                "payment.paidAmount",
                Number(unitPrice ?? 0) * Number(initialQuantity ?? 0) || 0
            );
        }
    }, [unitPrice, initialQuantity, form]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6 mb-16">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Image
                                src="/images/chick.png"
                                alt="Bird"
                                width={40}
                                height={40}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Create New Batch
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Register a new poultry batch with supplier and
                                allocation details
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="space-y-6"
                    >
                        {/* ========== Batch Information ========== */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6 text-primary" />
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Batch Information
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Initial batch parameters and feed
                                            selection
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="initialQuantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Initial Quantity
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
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
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                            BIRD
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="breed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Breed Type
                                                </FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select breed" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(
                                                            BirdBreeds
                                                        ).map((breed) => (
                                                            <SelectItem
                                                                key={breed}
                                                                value={breed}
                                                            >
                                                                {breed}
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
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Batch Start Date
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
                                        name="feedId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Feed</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select feed" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {feedList &&
                                                            feedList?.map(
                                                                (feed) => (
                                                                    <SelectItem
                                                                        key={
                                                                            feed.id
                                                                        }
                                                                        value={
                                                                            feed.id
                                                                        }
                                                                    >
                                                                        {
                                                                            feed.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                            </CardContent>
                        </Card>

                        {/* ========== Supplier & Payment Details ========== */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold">
                                        Supplier & Payment Details
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Configure supplier information and
                                        payment method
                                    </p>
                                </div>
                            </div>

                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border-b pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Truck
                                            size={20}
                                            className="text-primary"
                                        />
                                        Supplier Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                        <div className="md:col-span-5 col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="supplierId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Select Supplier
                                                        </FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Choose supplier" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {suppliersList.map(
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
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2 col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="paymentStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Status
                                                        </FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(
                                                                    PaymentStatus
                                                                ).map((s) => (
                                                                    <SelectItem
                                                                        key={s}
                                                                        value={
                                                                            s
                                                                        }
                                                                    >
                                                                        {s}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                        <div className="md:col-span-5 col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="unitPrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Unit Price
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
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
                                                                            e
                                                                                .target
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
                                                                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
                                                                    BDT
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2 col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="payment.method"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Payment Method
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                disabled={
                                                                    paymentStatus ===
                                                                    "UNPAID"
                                                                }
                                                                value={
                                                                    field.value
                                                                }
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select method" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(
                                                                        PaymentMethod
                                                                    ).map(
                                                                        (m) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    m
                                                                                }
                                                                                value={
                                                                                    m
                                                                                }
                                                                            >
                                                                                {formatEnums(
                                                                                    m
                                                                                )}
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {paymentStatus !== PaymentStatus.UNPAID && (
                                        <React.Fragment>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="payment.paidAmount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Paid Amount
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    disabled={
                                                                        paymentStatus !==
                                                                        "PARTIAL"
                                                                    }
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="0"
                                                                    {...field}
                                                                    value={
                                                                        Number(
                                                                            field.value
                                                                        ) || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const val =
                                                                            e
                                                                                .target
                                                                                .value;
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
                                                    name="payment.paymentDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Payment Date
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    value={
                                                                        field.value instanceof
                                                                        Date
                                                                            ? field.value
                                                                                  .toISOString()
                                                                                  .slice(
                                                                                      0,
                                                                                      10
                                                                                  )
                                                                            : ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.onChange(
                                                                            new Date(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="payment.fromInstrumentId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                From (Your
                                                                Account)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onValueChange={
                                                                        field.onChange
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select account" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredUserInstruments ? (
                                                                            filteredUserInstruments?.map(
                                                                                (
                                                                                    inst
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            inst.id
                                                                                        }
                                                                                        value={
                                                                                            inst.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            inst.label
                                                                                        }
                                                                                    </SelectItem>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            <SelectItem
                                                                                disabled
                                                                                value="none"
                                                                            >
                                                                                Select
                                                                                payment
                                                                                method
                                                                                first
                                                                            </SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="payment.toInstrumentId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                To (Supplier
                                                                Account)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onValueChange={
                                                                        field.onChange
                                                                    }
                                                                    disabled={
                                                                        !supplierId
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select supplier account" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredSupplierInstruments ? (
                                                                            filteredSupplierInstruments?.map(
                                                                                (
                                                                                    inst
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            inst.id
                                                                                        }
                                                                                        value={
                                                                                            inst.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            inst.label
                                                                                        }
                                                                                    </SelectItem>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            <SelectItem
                                                                                disabled
                                                                                value="none"
                                                                            >
                                                                                Select
                                                                                payment
                                                                                method
                                                                                first
                                                                            </SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="payment.transactionRef"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Transaction
                                                                Reference
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Optional"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="payment.handledById"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Handled By
                                                            </FormLabel>
                                                            <FormControl>
                                                                <ActorSelectAsync
                                                                    type="ADMIN"
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onChange={
                                                                        field.onChange
                                                                    }
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </React.Fragment>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* ========== House Allocation ========== */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <Home className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            House Allocation
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Distribute batch across available
                                            houses
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    className="gap-2"
                                    onClick={() =>
                                        allocationAppend({
                                            houseId: "",
                                            allocationType: "PARTIAL",
                                            quantity: 0,
                                        })
                                    }
                                >
                                    <Plus className="h-4 w-4" />
                                    Add House
                                </Button>
                            </div>

                            {allocationFields.map((field, index) => (
                                <Card
                                    key={field.id}
                                    className="border-0 shadow-md"
                                >
                                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-50 dark:from-green-950/30 dark:to-green-950/30 border-b pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Home
                                                    size={18}
                                                    className="text-primary"
                                                />
                                                House {index + 1}
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    allocationRemove(index)
                                                }
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`allocation.${index}.houseId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            House
                                                        </FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select house" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {allocationHousesIsLoading ? (
                                                                    <div>
                                                                        Fetching
                                                                        Houses...
                                                                    </div>
                                                                ) : (
                                                                    housesList.map(
                                                                        (h) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    h.id
                                                                                }
                                                                                value={
                                                                                    h.id
                                                                                }
                                                                                className="space-x-5"
                                                                            >
                                                                                {
                                                                                    h.label
                                                                                }
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
                                                name={`allocation.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Quantity
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
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
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const val =
                                                                            e
                                                                                .target
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
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                                    CHICKS
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
                            ))}
                        </div>

                        {/* ========== Form Actions ========== */}
                        <div className="flex gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Spinner />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Batch"
                                )}
                            </Button>
                        </div>

                        {/* Info Callout */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <span className="font-semibold">Note:</span> All
                                batches require at least one house allocation
                                and supplier information. You can edit these
                                details later from the batch details page.
                            </p>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
