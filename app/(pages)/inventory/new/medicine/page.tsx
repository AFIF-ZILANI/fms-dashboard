"use client";

import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

import { Units } from "@/app/generated/prisma/enums";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { toast } from "sonner";

/* -------------------------------------------------
   Schema
-------------------------------------------------- */

const medicineSchema = z.object({
    name: z.string().min(1, "Name is required"),

    category: z.enum(["MEDICINE", "SUPPLEMENT", "VACCINE"]),

    unit: z.nativeEnum(Units),

    form: z.enum(["LIQUID", "POWDER", "TABLET"]),

    route: z.enum(["ORAL", "INJECTION", "WATER"]),

    strength: z.string().min(1, "Strength is required"),

    company: z.string().optional(),
    manufacturer: z.string().optional(),

    withdrawalDays: z.string().optional(),
    storage: z.string().optional(),

    notes: z.string().optional(),
});

type MedicineForm = z.infer<typeof medicineSchema>;

/* -------------------------------------------------
   Page
-------------------------------------------------- */

export default function AddMedicinePage() {
    const form = useForm<MedicineForm>({
        resolver: zodResolver(medicineSchema),
        defaultValues: {
            category: "MEDICINE",
        },
    });

    const { mutate, isPending, isSuccess, isError, error } = usePostData(
        "/create/inventory/item"
    );

    useEffect(() => {
        if (isSuccess) {
            toast.success("Medical item created successfully");
            form.reset({ category: "MEDICINE" });
        }

        if (isError && error) {
            toast.error(error.message || "Failed to create item");
        }
    }, [isSuccess, isError, error, form]);

    const onSubmit = (values: MedicineForm) => {
        const metaData = {
            COMPANY: values.company,
            MANUFACTURER: values.manufacturer,
            FORM: values.form,
            ROUTE: values.route,
            STRENGTH: values.strength,
            WITHDRAWAL_DAYS: values.withdrawalDays,
            STORAGE: values.storage,
            NOTES: values.notes,
        };

        mutate({
            name: values.name,
            category: values.category,
            unit: values.unit,
            isMetaDataAvailable: true,
            metaData: Object.fromEntries(
                Object.entries(metaData).filter(([_, v]) => v && v.trim())
            ),
        });
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* ---------------- Header ---------------- */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Add Medicine / Supplement / Vaccine
                </h1>
                <p className="text-sm text-muted-foreground">
                    Register medical inventory with proper formulation,
                    administration route, and safety information.
                </p>
            </div>

            {/* ---------------- Form Card ---------------- */}
            <div className="rounded-lg border bg-background p-6 shadow-sm">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {/* ---------------- Basic Info ---------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium">
                                Basic Information
                            </h2>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
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

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
                                <div className="col-span-7">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MEDICINE">
                                                            Medicine
                                                        </SelectItem>
                                                        <SelectItem value="SUPPLEMENT">
                                                            Supplement
                                                        </SelectItem>
                                                        <SelectItem value="VACCINE">
                                                            Vaccine
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                    Stock Unit
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
                                                        {Object.values(
                                                            Units
                                                        ).map((u) => (
                                                            <SelectItem
                                                                key={u}
                                                                value={u}
                                                            >
                                                                {u}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ---------------- Medical Details ---------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium">
                                Medical Details
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="form"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Form</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LIQUID">
                                                        Liquid
                                                    </SelectItem>
                                                    <SelectItem value="POWDER">
                                                        Powder
                                                    </SelectItem>
                                                    <SelectItem value="TABLET">
                                                        Tablet
                                                    </SelectItem>
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
                                            <FormLabel>Route</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ORAL">
                                                        Oral
                                                    </SelectItem>
                                                    <SelectItem value="INJECTION">
                                                        Injection
                                                    </SelectItem>
                                                    <SelectItem value="WATER">
                                                        Water
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="strength"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Strength / Power
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. 10 mg/ml"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        {/* ---------------- Manufacturer ---------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium">
                                Manufacturer Information
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Company / Brand
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="manufacturer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Manufacturer</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        {/* ---------------- Safety ---------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-medium">
                                Safety & Storage
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="withdrawalDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Withdrawal Days
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. 7"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="storage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Storage Condition
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Cool & dry place"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Any additional information"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </section>

                        {/* ---------------- Actions ---------------- */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
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
