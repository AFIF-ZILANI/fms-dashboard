"use client";

import { Package, Pill, Save, Shield, ChevronDown } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrganizationRole, Units } from "@/app/generated/prisma/enums";
import { usePostData } from "@/lib/api-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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

import { toast } from "sonner";
import {
    AddMedicineInput,
    addMedicineSchema,
    AddStockItemSchema,
} from "@/schemas/item.schema";
import { MedicineCategory, MedicineForm, MedicineRoute } from "@/types/enum";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEnums } from "@/lib/strings";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { OrganizationSelectAsync } from "@/components/org-search-or-create-select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* -------------------------------------------------
   Schema
-------------------------------------------------- */

type MetaRow = {
    key: string;
    value: string;
};

const storageDefaults: Record<string, number | undefined> = {
    ROOM: 25,
    REFRIGERATOR: 5,
    FREEZER: -10,
    OTHER: undefined,
};

/* -------------------------------------------------
   Page
-------------------------------------------------- */

export default function AddMedicinePage() {
    const [resetCounter, setResetCounter] = useState(0);
    const [metaRows, setMetaRows] = useState<MetaRow[]>([
        { key: "", value: "" },
    ]);

    const form = useForm<AddMedicineInput>({
        resolver: zodResolver(addMedicineSchema),
        defaultValues: {
            category: MedicineCategory.MEDICINE,
            form: MedicineForm.LIQUID,
            route: MedicineRoute.WATER,
            name: "",
            unit: Units.L,
            withdrawalDays: 0,
        },
    });

    const { mutate, isPending: submitIsPending } =
        usePostData("/create/stock/item");

    const handleReset = useCallback(() => {
        form.reset({
            name: "",
            reorderLevel: undefined,
            manufacturerId: undefined,
            importerId: undefined,
            marketerId: undefined,
            distributorId: undefined,
        });

        setResetCounter((prev) => prev + 1);
        setMetaRows([{ key: "", value: "" }]);
    }, [form]);

    /* ---------------- Metadata Helpers ---------------- */

    const normalizeKey = (value: string) =>
        value
            .toUpperCase()
            .replace(/\s+/g, "_")
            .replace(/[^A-Z0-9_]/g, "");

    const addRow = () => setMetaRows([...metaRows, { key: "", value: "" }]);

    const removeRow = (index: number) =>
        setMetaRows(metaRows.filter((_, i) => i !== index));

    const updateRow = (
        index: number,
        field: "key" | "value",
        value: string
    ) => {
        const copy = [...metaRows];
        copy[index][field] = value;
        setMetaRows(copy);
    };

    const metadata = useMemo(() => {
        const entries = metaRows.filter((r) => r.key.trim() && r.value.trim());
        const keys = entries.map((e) => e.key);
        const uniqueKeys = new Set(keys);

        if (keys.length !== uniqueKeys.size) {
            throw new Error("Duplicate metadata keys detected");
        }

        const metadata = Object.fromEntries(
            entries.map((r) => [r.key, r.value])
        );

        return metadata;
    }, [metaRows]);

    const category = useWatch({
        control: form.control,
        name: "category",
    });

    const onError = (error: unknown) => {
        console.error("[Error]", error);
    };

    const onSubmit = (values: AddMedicineInput) => {
        console.log("[Submit values after processing]", values);
        const mData: Record<string, string> = {
            ...metadata,
            FORM: values.form,
            ROUTE: values.route,
            STORAGE_TEMP_IN_CELSIUS:
                values.storageTempInCelsius?.toString() ?? "",
            WITHDRAWAL_DAYS: values.withdrawalDays?.toString() ?? "",
        };
        for (const [key, value] of Object.entries(mData)) {
            if (value === "") {
                delete mData[key];
            }
        }

        const obj: AddStockItemSchema = {
            name: values.name,
            category: values.category,
            unit: values.unit,
            reorderLevel: values.reorderLevel,
            isMetaDataAvailable: true,
            metaData: mData,
            manufacturerId: values.manufacturerId,
            importerId: values.importerId,
            marketerId: values.marketerId,
            distributorId: values.distributorId,
        };
        // console.log("[Submit object]", obj);
        mutate(obj, {
            onSuccess: () => {
                toast.success("Medicine item added successfully");
                handleReset();
            },
            onError: (err: unknown) => {
                toast.error(
                    (err as Error).message || "Failed to add medicine item"
                );
            },
        });
    };

    const getCategoryInfo = () => {
        const info: Record<
            string,
            { icon: React.ReactNode; description: string; color: string }
        > = {
            MEDICINE: {
                icon: <Pill className="w-4 h-4" />,
                description: "Therapeutic medicines for treating diseases",
                color: "bg-blue-50 border-blue-200",
            },
            SUPPLEMENT: {
                icon: <Package className="w-4 h-4" />,
                description: "Nutritional supplements for enhanced health",
                color: "bg-green-50 border-green-200",
            },
            VACCINE: {
                icon: <Shield className="w-4 h-4" />,
                description: "Vaccines for disease prevention",
                color: "bg-purple-50 border-purple-200",
            },
        };
        return info[category] || info.MEDICINE;
    };

    const categoryInfo = getCategoryInfo();

    const storageCondition = useWatch({
        control: form.control,
        name: "storageCondition",
    });

    const importerId = useWatch({
        control: form.control,
        name: "importerId",
    });

    const marketerId = useWatch({
        control: form.control,
        name: "marketerId",
    });

    const distributorId = useWatch({
        control: form.control,
        name: "distributorId",
    });

    // Track if user manually edited temp
    const tempManuallyEdited = useRef(false);

    useEffect(() => {
        if (!storageCondition) return;

        // If condition is OTHER, do not auto set
        if (storageCondition === "OTHER") {
            return;
        }

        // If user already manually edited, don't override
        if (tempManuallyEdited.current) {
            return;
        }

        const defaultTemp = storageDefaults[storageCondition];

        if (defaultTemp !== undefined) {
            form.setValue("storageTempInCelsius", defaultTemp, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [storageCondition, form]);

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Page Title */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Add Medicine / Supplement / Vaccine
                </h2>
                <p className="text-slate-600">
                    Register medical inventory with proper formulation,
                    administration route, and safety information for your
                    poultry farm.
                </p>
            </div>

            {/* Category Info Card */}
            <Card className={` border-2 ${categoryInfo.color}`}>
                <CardContent className="">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                            {categoryInfo.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">
                                {category === "MEDICINE" &&
                                    "Therapeutic Medicine"}
                                {category === "SUPPLEMENT" &&
                                    "Nutritional Supplement"}
                                {category === "VACCINE" && "Preventive Vaccine"}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {categoryInfo.description}
                            </p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                            {category}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* ---------------- Form Card ---------------- */}
            <div className="rounded-lg border bg-background p-6 shadow-sm">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="space-y-8"
                    >
                        {/* ---------------- Basic Info ---------------- */}
                        <section className="space-y-4">
                            <Label className="text-lg font-medium">
                                Basic Information
                            </Label>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Product Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Amoxicillin"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Category{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(
                                                    MedicineCategory
                                                ).map((category) => (
                                                    <SelectItem
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
                                <div className="col-span-7">
                                    <FormField
                                        control={form.control}
                                        name="reorderLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Reorder Level
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Stock Unit{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="L">
                                                            Liters (L)
                                                        </SelectItem>
                                                        <SelectItem value="ML">
                                                            Milliliters (ML)
                                                        </SelectItem>
                                                        <SelectItem value="G">
                                                            Grams (G)
                                                        </SelectItem>
                                                        <SelectItem value="KG">
                                                            Kilograms (KG)
                                                        </SelectItem>
                                                        <SelectItem value="PCS">
                                                            Pieces (PCS)
                                                        </SelectItem>
                                                        <SelectItem value="VIAL">
                                                            Vials
                                                        </SelectItem>
                                                        <SelectItem value="DOSE">
                                                            Doses
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ---------------- Medical Details ---------------- */}
                        <section className="space-y-4 mt-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Medical Details
                                    </Label>
                                    <div className="flex-1">
                                        <Separator className="w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Specify the form and administration route
                                    for this product
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="form"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Form{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(
                                                        MedicineForm
                                                    ).map((form) => (
                                                        <SelectItem
                                                            key={form}
                                                            value={form}
                                                        >
                                                            {formatEnums(form)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="route"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {" "}
                                                Administration Route{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(
                                                        MedicineRoute
                                                    ).map((route) => (
                                                        <SelectItem
                                                            key={route}
                                                            value={route}
                                                        >
                                                            {formatEnums(route)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        {/* ---------------- Manufacturer ---------------- */}
                        <section className="space-y-4 mt-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Manufacturer Information
                                    </Label>
                                    <div className="flex-1">
                                        <Separator className="w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Specify the company or brand that
                                    manufactures this product
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="manufacturerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Manufacturer{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <OrganizationSelectAsync
                                                onChange={field.onChange}
                                                type={
                                                    OrganizationRole.MANUFACTURER
                                                }
                                                value={field.value}
                                                allowCreate
                                                resetKey={resetCounter}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Collapsible
                                defaultOpen={
                                    !!importerId ||
                                    !!marketerId ||
                                    !!distributorId
                                }
                            >
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-left transition hover:bg-muted"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">
                                                Other Information
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Importer, marketer, distributor
                                                (optional)
                                            </span>
                                        </div>

                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                                    </button>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="mt-4">
                                    <div className="grid grid-cols-1 gap-4 rounded-lg border bg-background p-4">
                                        <FormField
                                            control={form.control}
                                            name="importerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Imported By
                                                        <span className="text-xs text-muted-foreground">
                                                            (Optional)
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <OrganizationSelectAsync
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            type={
                                                                OrganizationRole.IMPORTER
                                                            }
                                                            value={field.value}
                                                            allowCreate
                                                            resetKey={
                                                                resetCounter
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="marketerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Marketed By
                                                        <span className="text-xs text-muted-foreground">
                                                            (Optional)
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <OrganizationSelectAsync
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            type={
                                                                OrganizationRole.MARKETER
                                                            }
                                                            value={field.value}
                                                            allowCreate
                                                            resetKey={
                                                                resetCounter
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="distributorId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Distributed By
                                                        <span className="text-xs text-muted-foreground">
                                                            (Optional)
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <OrganizationSelectAsync
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            type={
                                                                OrganizationRole.DISTRIBUTOR
                                                            }
                                                            value={field.value}
                                                            allowCreate
                                                            resetKey={
                                                                resetCounter
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </section>

                        {/* ---------------- Safety ---------------- */}
                        <section className="space-y-4 mt-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Safety & Storage
                                    </Label>
                                    <div className="flex-1">
                                        <Separator className="w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Set withdrawal period and optimal storage
                                    conditions
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="withdrawalDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Withdrawal Days</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    pattern="[0-9]*"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        // Allow only digits
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
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                                    days
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Days before product use for
                                            consumption
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Storage Condition */}
                                <FormField
                                    control={form.control}
                                    name="storageCondition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                Storage Condition
                                                <span className="text-xs text-muted-foreground">
                                                    (Optional)
                                                </span>
                                            </FormLabel>

                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select storage condition" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="ROOM">
                                                            Room Temperature
                                                            (15–25°C)
                                                        </SelectItem>
                                                        <SelectItem value="REFRIGERATOR">
                                                            Refrigerator (2–8°C)
                                                        </SelectItem>
                                                        <SelectItem value="FREEZER">
                                                            Freezer (Below
                                                            -10°C)
                                                        </SelectItem>
                                                        <SelectItem value="OTHER">
                                                            Other
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Storage Temp */}
                                <FormField
                                    control={form.control}
                                    name="storageTempInCelsius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                Optimal Storage Temperature
                                                <span className="text-xs text-muted-foreground">
                                                    (Optional)
                                                </span>
                                            </FormLabel>

                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder={
                                                            storageCondition ===
                                                            "OTHER"
                                                                ? "Enter temperature"
                                                                : "Auto set based on condition"
                                                        }
                                                        value={
                                                            field.value ===
                                                            undefined
                                                                ? ""
                                                                : String(
                                                                      field.value
                                                                  )
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;

                                                            // Allow user typing states:
                                                            // "", "-", ".", "-.", "12", "-12", "12.5", "-12.5", "12."
                                                            if (
                                                                /^-?\d*\.?\d*$/.test(
                                                                    val
                                                                )
                                                            ) {
                                                                tempManuallyEdited.current = true;

                                                                // Don't convert incomplete typing states into NaN
                                                                if (
                                                                    val ===
                                                                        "" ||
                                                                    val ===
                                                                        "-" ||
                                                                    val ===
                                                                        "." ||
                                                                    val === "-."
                                                                ) {
                                                                    field.onChange(
                                                                        undefined
                                                                    );
                                                                    return;
                                                                }

                                                                field.onChange(
                                                                    Number(val)
                                                                );
                                                            }
                                                        }}
                                                    />

                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                        °C
                                                    </span>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        {/* ---------------- Other Information ---------------- */}
                        <section className="space-y-4 mt-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Metadata
                                    </Label>
                                    <div className="flex-1">
                                        <Separator className="w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Optional key-value pairs, similar to
                                    environment variables. Useful for medicine,
                                    feed specs, or vendor details.
                                </p>
                            </div>

                            <div className="rounded-md border">
                                <div className="grid grid-cols-[1fr_1fr_40px] border-b bg-muted px-3 py-2 text-xs font-medium">
                                    <span>KEY</span>
                                    <span>VALUE</span>
                                    <span />
                                </div>

                                {metaRows.map((row, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 border-b px-3 py-2"
                                    >
                                        <Input
                                            placeholder="KEY"
                                            value={row.key}
                                            onChange={(e) =>
                                                updateRow(
                                                    i,
                                                    "key",
                                                    normalizeKey(e.target.value)
                                                )
                                            }
                                        />

                                        <Input
                                            placeholder="VALUE"
                                            value={row.value}
                                            onChange={(e) =>
                                                updateRow(
                                                    i,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(i)}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}

                                <div className="p-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={addRow}
                                    >
                                        + Add Variable
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* ---------------- Actions ---------------- */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={submitIsPending}>
                                {submitIsPending ? (
                                    <Spinner />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Create Medical Item
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
