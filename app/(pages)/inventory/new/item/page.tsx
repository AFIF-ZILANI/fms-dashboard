"use client";

import { ChevronDown, RefreshCcw, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    OrganizationRole,
    ResourceCategories,
    Units,
} from "@/app/generated/prisma/enums";
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

import { addStockItemSchema, AddStockItemSchema } from "@/schemas/item.schema";
import { Spinner } from "@/components/ui/spinner";
import { useCallback, useMemo, useState } from "react";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";
import { OrganizationSelectAsync } from "@/components/org-search-or-create-select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type MetaRow = {
    key: string;
    value: string;
};

export default function NewStockItemPage() {
    const [resetCounter, setResetCounter] = useState(0);
    const [metaRows, setMetaRows] = useState<MetaRow[]>([
        { key: "", value: "" },
    ]);

    const form = useForm<AddStockItemSchema>({
        resolver: zodResolver(addStockItemSchema),
        defaultValues: {
            isMetaDataAvailable: false,
            name: "",
            unit: Units.KG,
            category: ResourceCategories.FEED,
        },
    });

    const { mutate, isPending: submitIsPending } =
        usePostData("/create/stock/item");

    const handleReset = useCallback(() => {
        form.reset({
            isMetaDataAvailable: false,
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

    const { metadata, isMetaDataAvailable } = useMemo(() => {
        const entries = metaRows.filter((r) => r.key.trim() && r.value.trim());
        const keys = entries.map((e) => e.key);
        const uniqueKeys = new Set(keys);

        if (keys.length !== uniqueKeys.size) {
            throw new Error("Duplicate metadata keys detected");
        }

        const hasData = keys.length > 0;
        const metadata = Object.fromEntries(
            entries.map((r) => [r.key, r.value])
        );

        return { metadata, isMetaDataAvailable: hasData };
    }, [metaRows]);

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: AddStockItemSchema) => {
        try {
            mutate(
                {
                    ...values,
                    isMetaDataAvailable,
                    metaData: metadata,
                },
                {
                    onSuccess: () => {
                        toast.success("Stock item created successfully");
                        handleReset();
                    },
                    onError: (err: unknown) => {
                        toast.error(
                            (err as Error).message || "Failed to create item"
                        );
                    },
                }
            );
        } catch (err: unknown) {
            toast.error((err as Error).message);
        }
    };

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

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create Stock Item
                </h1>
                <p className="text-sm text-muted-foreground">
                    Define a new inventory item and optionally attach structured
                    metadata for future tracking and analytics.
                </p>
            </div>

            {/* Form Card */}
            <div className="rounded-lg border bg-background p-6 shadow-sm">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <section className="space-y-4">
                            {/* Basic Info */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Basic Information
                                    </Label>
                                    <div className="flex-1">
                                        <Separator className="w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Provide basic details about the item
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Item Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Tox Safe Plus"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="reorderLevel"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>
                                                Reorder Level{" "}
                                                <span className="text-xs text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    inputMode="decimal"
                                                    placeholder="e.g. 10.5"
                                                    value={
                                                        typeof field.value ===
                                                            "string" ||
                                                        typeof field.value ===
                                                            "number"
                                                            ? field.value
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        let v = e.target.value;

                                                        if (
                                                            !/^\d*\.?\d*$/.test(
                                                                v
                                                            )
                                                        )
                                                            return;

                                                        if (/^0\d+/.test(v)) {
                                                            v = v.replace(
                                                                /^0+/,
                                                                ""
                                                            );
                                                        }

                                                        if (v.startsWith(".")) {
                                                            v = "0" + v;
                                                        }

                                                        field.onChange(v);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <div className="grid gap-4 md:grid-cols-10">
                                <div className="col-span-7">
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
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    {/* <FormControl> */}
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    {/* </FormControl> */}
                                                    <SelectContent>
                                                        {Object.values(
                                                            ResourceCategories
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
                                                    Unit{" "}
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
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(
                                                            Units
                                                        ).map((val) => (
                                                            <SelectItem
                                                                key={val}
                                                                value={val}
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
                                </div>
                            </div>
                        </section>
                        {/* ---------------- Manufacturer ---------------- */}
                        <section className="space-y-4">
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
                                            <span className="text-xs text-muted-foreground">
                                                (optional)
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
                        {/* Metadata Section */}
                        <div className="space-y-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg font-medium">
                                        Metadata{" "}
                                        <span className="text-xs text-muted-foreground">
                                            (optional)
                                        </span>
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
                        </div>
                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleReset}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>

                            <Button type="submit" disabled={submitIsPending}>
                                {submitIsPending ? (
                                    <Spinner />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Create Item
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
