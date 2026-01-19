"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/* ---------------- UI ---------------- */

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

/* ---------------- Table ---------------- */

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Save, Trash2 } from "lucide-react";

/* ---------------- Domain ---------------- */

import {
    Units,
    PaymentStatus,
    UserRole,
    PaymentMethod,
} from "@/app/generated/prisma/enums";
import { ActorSelectAsync } from "@/components/actor-search-select";
import {
    PurchaseItemFormInput,
    purchaseItemSchema,
    PurchaseItemInput,
} from "@/schemas/purchase-items.schema";
import { useGetData, usePostData } from "@/lib/api-request";
import { Label } from "@/components/ui/label";
import { Item } from "@/types/purchase";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyInBDT } from "@/lib/strings";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { InitialStockItemForm } from "@/components/fab-dialogs/add-initial-stock-item.dialog";

const ADMIN_ID = "35204ae0-a642-4bbb-996b-c8b800fc0643";

interface ItemsListResponse {
    data: Item[];
}

interface InstrumentsResponse {
    id: string;
    label: string;
    type: PaymentMethod;
}

export default function NewPurchasePage() {
    const { data: itemsListRes } = useGetData<ItemsListResponse>(
        "/get/stock/items/all"
    );

    const { mutate, isError, error, isSuccess, isPending } = usePostData(
        "/create/purchase/item"
    );

    const { data: userInstrumentsRes } = useGetData<{
        data: InstrumentsResponse[];
    }>(`/get/payments/instruments/user?id=${ADMIN_ID}&type=${UserRole.ADMIN}`);

    const [supplierInstruments, setSupplierInstruments] = useState<
        InstrumentsResponse[]
    >([]);
    const router = useRouter();

    const form = useForm<PurchaseItemFormInput>({
        resolver: zodResolver(purchaseItemSchema),
        defaultValues: {
            invoiceNo: "",
            note: "",
            purchaseDate: new Date(),
            discount: 0,
            transportCost: 0,
            paymentStatus: PaymentStatus.PAID,
            items: [],
            payment: {
                paymentDate: new Date(),
                transactionRef: "",
            },
        },
    });

    const supplierId = useWatch({
        control: form.control,
        name: "supplierId",
    });

    const paymentStatus = useWatch({
        control: form.control,
        name: "paymentStatus",
    });

    const paymentMethod = useWatch({
        control: form.control,
        name: "payment.method",
    });

    const itemsList = itemsListRes?.data || [];
    const userInstruments = userInstrumentsRes?.data || [];

    const [rows, setRows] = useState<
        (Partial<PurchaseItemInput> & { tempId?: string })[]
    >([]);

    const subtotal = useMemo(
        () =>
            rows.reduce<number>(
                (s, r) =>
                    s + (Number(r.quantity) ?? 0) * (r.unitPrice as number),
                0
            ),
        [rows]
    );

    const discount = Number(form.watch("discount")) || 0;
    const transportCost = Number(form.watch("transportCost")) || 0;
    const grandTotal = subtotal - (subtotal * discount) / 100 + transportCost;

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

    useEffect(() => {
        if (paymentStatus !== PaymentStatus.PARTIAL) {
            form.setValue("payment.paidAmount", grandTotal, {
                shouldDirty: false,
                shouldTouch: false,
            });
        }
        if (paymentStatus === PaymentStatus.UNPAID) {
            form.setValue("payment", undefined);
        }
    }, [paymentStatus, subtotal, discount, transportCost, form]);

    useEffect(() => {
        const items = rows.map((r) => ({
            itemId: r.itemId!,
            quantity: r.quantity!,
            unit: r.unit!,
            unitPrice: r.unitPrice,
        }));

        form.setValue("items", items, { shouldValidate: true });
    }, [rows, form]);

    useEffect(() => {
        if (isSuccess) {
            form.reset();
            setRows([]);
            toast.success("Purchase created successfully");
            router.back();
        }

        if (isError) {
            toast.error(error.message || "Failed to create purchase");
        }
    }, [isSuccess, form, isError, error]);

    const columns: ColumnDef<
        Partial<PurchaseItemInput> & { tempId?: string }
    >[] = [
        {
            id: "itemId",
            header: "Item Name",
            cell: ({ row }) => (
                <Select
                    value={row.original.itemId || ""}
                    onValueChange={(v) => {
                        const selectedItem = itemsList.find((i) => i.id === v);
                        console.log(row.original);
                        updateRow(row.original.tempId!, {
                            itemId: v,
                            unit: selectedItem?.unit as Units,
                        });
                    }}
                >
                    <SelectTrigger className="w-[30rem]">
                        <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                        {itemsList.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                <span className="font-semibold">
                                    {item.name}
                                </span>{" "}
                                - <span>{item.company || "Unknown"}</span>-
                                <Badge variant="outline" className="ml-2">
                                    {item.category}
                                </Badge>{" "}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
        {
            id: "quantity",
            header: "Quantity",
            cell: ({ row }) => {
                const [value, setValue] = useState<string>(
                    String(row.original.quantity ?? "")
                );

                useEffect(() => {
                    setValue(String(row.original.quantity ?? ""));
                }, [row.original.quantity]);

                return (
                    <Input
                        inputMode="decimal"
                        placeholder="e.g. 10.5"
                        value={value}
                        onChange={(e) => {
                            let v = e.target.value;

                            if (!/^\d*\.?\d*$/.test(v)) return;

                            if (/^0\d+/.test(v)) {
                                v = v.replace(/^0+/, "");
                            }

                            if (v.startsWith(".")) {
                                v = "0" + v;
                            }

                            setValue(v);
                        }}
                        onBlur={() => {
                            updateRow(row.original.tempId!, {
                                quantity: value,
                            });
                        }}
                    />
                );
            },
        },
        {
            id: "unit",
            header: "Unit",
            cell: ({ row }) => (
                <Label>
                    {row.original.unit ? row.original.unit : "unknown"}
                </Label>
            ),
        },
        {
            id: "unitPrice",
            header: "Unit Price (৳)",
            cell: ({ row }) => {
                const [value, setValue] = useState<string>(
                    String(row.original.unitPrice ?? "")
                );

                useEffect(() => {
                    setValue(String(row.original.unitPrice ?? ""));
                }, [row.original.unitPrice]);

                return (
                    <Input
                        inputMode="decimal"
                        placeholder="e.g. 10.5"
                        value={value}
                        onChange={(e) => {
                            let v = e.target.value;

                            if (!/^\d*\.?\d*$/.test(v)) return;

                            if (/^0\d+/.test(v)) {
                                v = v.replace(/^0+/, "");
                            }

                            if (v.startsWith(".")) {
                                v = "0" + v;
                            }

                            setValue(v);
                        }}
                        onBlur={() => {
                            updateRow(row.original.tempId!, {
                                unitPrice: value,
                            });
                        }}
                    />
                );
            },
        },
        {
            id: "total",
            header: "Total",
            cell: ({ row }) => {
                const quantity = Number(row.original.quantity) || 0;
                const unitPrice = Number(row.original.unitPrice) || 0;
                return (
                    <span className="font-medium w-full">
                        {formatCurrencyInBDT(quantity * unitPrice)}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(row.original.tempId!)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    // useEffect(() => console.log(rows), [rows]);

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.tempId!,
    });

    function addRow() {
        setRows((p) => [
            ...p,
            {
                tempId: crypto.randomUUID(),
                quantity: 1,
                unit: Units.UNIT,
                unitPrice: 0,
                itemId: "",
            },
        ]);
    }

    function updateRow(id: string, patch: Partial<PurchaseItemInput>) {
        setRows((p) =>
            p.map((r) => (r.tempId === id ? { ...r, ...patch } : r))
        );
    }

    function removeRow(id: string) {
        setRows((p) => p.filter((r) => r.tempId !== id));
    }

    function onSubmit(values: PurchaseItemFormInput) {
        console.log("FINAL PAYLOAD", values);

        mutate(values);
    }
    function onError(errors: unknown) {
        console.log(form);
        console.log("FORM ERRORS", errors);
    }

    const filteredUserInstruments = userInstruments?.filter(
        (i) => i.type === paymentMethod
    );

    const filteredSupplierInstruments = supplierInstruments?.filter(
        (i) => i.type === paymentMethod
    );

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 mb-[5rem]">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold">New Purchase</h1>
                <p className="text-muted-foreground">
                    Record a supplier purchase with items and payment details.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, onError)}
                    className="space-y-6"
                >
                    {/* Header Section */}
                    <Card className="p-4 space-y-4">
                        <h2 className="text-lg font-semibold">
                            Purchase Information
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <FormControl>
                                            <ActorSelectAsync
                                                type="SUPPLIER"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="purchaseDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={
                                                    field.value instanceof Date
                                                        ? field.value
                                                              .toISOString()
                                                              .slice(0, 10)
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        new Date(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="invoiceNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice No</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Card>

                    {/* Items Section */}
                    <Card className="p-4 space-y-3">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Purchase Items</CardTitle>
                                <Button
                                    type="button"
                                    onClick={addRow}
                                    variant={"outline"}
                                >
                                    + Add Item
                                </Button>
                            </div>
                            <CardDescription>
                                Add items purchased from the supplier.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-[1rem]">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            className="bg-muted"
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext()
                                                                  )}
                                                        </TableHead>
                                                    )
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>

                                <TableBody>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Summary Section */}
                    <Card className="w-[420px] ml-auto">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Summary
                                    </h2>
                                    <span className="text-xs text-muted-foreground">
                                        Auto calculated
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm rounded-lg bg-muted p-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrencyInBDT(subtotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm text-muted-foreground">
                                                Discount (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    pattern="[0-9]*"
                                                    className="pr-12"
                                                    {...field}
                                                    value={
                                                        Number(field.value) ||
                                                        ""
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        if (/^\d*$/.test(val)) {
                                                            field.onChange(
                                                                val === ""
                                                                    ? ""
                                                                    : Number(
                                                                          val
                                                                      )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="transportCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm text-muted-foreground">
                                                Transport Cost (৳)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    pattern="[0-9]*"
                                                    className="pr-12"
                                                    {...field}
                                                    value={
                                                        Number(field.value) ||
                                                        ""
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        if (/^\d*$/.test(val)) {
                                                            field.onChange(
                                                                val === ""
                                                                    ? ""
                                                                    : Number(
                                                                          val
                                                                      )
                                                            );
                                                        }
                                                    }}
                                                    onBlur={field.onBlur}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center text-base font-semibold">
                                <span>Grand Total</span>
                                <span className="text-lg">
                                    {formatCurrencyInBDT(grandTotal)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Section */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Payment</h2>
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="paymentStatus"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(
                                                    PaymentStatus
                                                ).map((s) => (
                                                    <SelectItem
                                                        key={s}
                                                        value={s}
                                                    >
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {paymentStatus !== PaymentStatus.UNPAID && (
                                    <FormField
                                        control={form.control}
                                        name="payment.method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.values(
                                                                PaymentMethod
                                                            ).map((m) => (
                                                                <SelectItem
                                                                    key={m}
                                                                    value={m}
                                                                >
                                                                    {m}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {paymentStatus !== PaymentStatus.UNPAID && (
                            <>
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
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            if (
                                                                /^\d*$/.test(
                                                                    val
                                                                )
                                                            ) {
                                                                field.onChange(
                                                                    val === ""
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
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                new Date(
                                                                    e.target
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
                                                    From (Your Account)
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
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
                                                                    (inst) => (
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
                                                                    method first
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
                                                    To (Supplier Account)
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select supplier account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredSupplierInstruments ? (
                                                                filteredSupplierInstruments?.map(
                                                                    (inst) => (
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
                                                                    method first
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
                                                    Transaction Reference
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
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </Card>

                    <div className="flex justify-between">
                        <div className="flex gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Spinner /> : <Save />}
                            {isPending ? "Saving purchase" : "Save Purchase"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                    {itemsList.length && (
                            <InitialStockItemForm items={itemsList} />
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
