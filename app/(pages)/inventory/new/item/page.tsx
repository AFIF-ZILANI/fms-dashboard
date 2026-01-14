"use client";

import { RefreshCcw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResourceCategories, Units } from "@/app/generated/prisma/enums";
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

import { addStockItemSchema, AddStockItemSchema } from "@/schemas/item.schem";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";

type MetaRow = {
    key: string;
    value: string;
};

export default function NewStockItemPage() {
    const [metaRows, setMetaRows] = useState<MetaRow[]>([
        { key: "", value: "" },
    ]);

    const form = useForm<AddStockItemSchema>({
        resolver: zodResolver(addStockItemSchema),
        defaultValues: {
            isMetaDataAvailable: false,
            name: "",
        },
    });

    const {
        mutate,
        isPending: submitIsPending,
        isSuccess,
        isError,
        error,
    } = usePostData("/create/stock/item");

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("Stock item created successfully");
            form.reset();
            setMetaRows([{ key: "", value: "" }]);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to create item");
        }
    }, [isSuccess, isError, error, form]);

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

    let isMetaDataAvailable: boolean;

    const buildMetaData = () => {
        const entries = metaRows.filter((r) => r.key.trim() && r.value.trim());

        const keys = entries.map((e) => e.key);
        const uniqueKeys = new Set(keys);

        if (keys.length !== uniqueKeys.size) {
            throw new Error("Duplicate metadata keys detected");
        }
        if (keys.length) {
            isMetaDataAvailable = true;
        } else {
            isMetaDataAvailable = false;
        }
        return Object.fromEntries(entries.map((r) => [r.key, r.value]));
    };

    /* ---------------- Submit ---------------- */

    const onSubmit = (values: AddStockItemSchema) => {
        try {
            const metaData = buildMetaData();
            mutate({
                ...values,
                isMetaDataAvailable,
                metaData,
            });
        } catch (err: any) {
            toast.error(err.message);
        }
    };

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
                        {/* Basic Info */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name</FormLabel>
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

                        <div className="grid gap-4 md:grid-cols-10">
                            <div className="col-span-7">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(
                                                        ResourceCategories
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

                            <div className="col-span-3">
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(Units).map(
                                                        (val) => (
                                                            <SelectItem
                                                                key={val}
                                                                value={val}
                                                            >
                                                                {val}
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
                        </div>

                        {/* Metadata Section */}
                        <div className="space-y-2">
                            <div>
                                <h2 className="text-sm font-medium">
                                    Metadata
                                </h2>
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
                                onClick={() => {
                                    form.reset();
                                    setMetaRows([{ key: "", value: "" }]);
                                }}
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
