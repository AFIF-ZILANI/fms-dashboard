"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SupplierRoleNames,
    SupplierSupplyCategories,
} from "@/app/generated/prisma/enums";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import {
    CreateSupplierInput,
    createSupplierSchema,
} from "@/schemas/supplier.schema";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";
import { OptionalLabel, RequiredLabel } from "../helper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AddSupplierForm() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { mutate, isPending } = usePostData("/create/supplier");
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<CreateSupplierInput>({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: {
            name: "",
            mobile: "",
            email: "",
            address: "",
            role: undefined,
            type: [],
            company: "",
            avatar: undefined,
        },
    });

    const onSubmit = (data: CreateSupplierInput) => {
        const formData = new FormData();

        // Profile fields
        formData.append("name", data.name);
        formData.append("mobile", data.mobile);

        if (data.email) {
            formData.append("email", data.email);
        }

        if (data.address) {
            formData.append("address", data.address);
        }

        // Supplier fields
        formData.append("role", data.role);

        // IMPORTANT: arrays must be stringified
        formData.append("type", JSON.stringify(data.type));

        if (data.company) {
            formData.append("company", data.company);
        }

        // Avatar (File object from input)
        if (data.avatar && data.avatar[0]) {
            formData.append("avatar", data.avatar[0]);
        }

        console.log(formData);

        mutate(formData, {
            onSuccess: () => {
                form.reset();
                setPreviewUrl(null);
                toast.success("Supplier created successfully");
                router.push("/suppliers");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    // Helper to format enum values for display
    const formatEnumValue = (value: string): string => {
        return (
            value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ")
        );
    };
    const handleFileValidation = (file: File, field: any) => {
        // Type check
        if (!ALLOWED_TYPES.includes(file.type)) {
            form.setError("avatar", {
                type: "manual",
                message: "Only JPEG, PNG or WEBP images are allowed",
            });
            return;
        }

        // Size check
        if (file.size > MAX_FILE_SIZE) {
            form.setError("avatar", {
                type: "manual",
                message: "File must be under 5MB",
            });
            return;
        }

        // Clear previous errors
        form.clearErrors("avatar");

        field.onChange([file]);
        setPreviewUrl(URL.createObjectURL(file));
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold">Add New Supplier</h1>
                    <p className="text-muted-foreground mt-2">
                        Create a new supplier profile and manage their supply
                        information
                    </p>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Profile Information Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Basic contact and profile details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel label="Supplier Name" />
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter supplier name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Grid: Mobile & Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="mobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel label="Mobile Number" />
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter phone number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <OptionalLabel label="Email Address" />
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Address */}
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <OptionalLabel label="Address" />
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter supplier address"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Avatar Upload */}

                                <FormField
                                    control={form.control}
                                    name="avatar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <OptionalLabel label="Avatar" />
                                            </FormLabel>

                                            <FormControl>
                                                <div
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDragEnter={() =>
                                                        setIsDragging(true)
                                                    }
                                                    onDragLeave={() =>
                                                        setIsDragging(false)
                                                    }
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                        const file =
                                                            e.dataTransfer
                                                                .files?.[0];
                                                        if (!file) return;
                                                        handleFileValidation(
                                                            file,
                                                            field
                                                        );
                                                    }}
                                                    className={`
            relative
            w-40 h-40   /* square */
            rounded-xl
            border-2 border-dashed
            flex items-center justify-center
            overflow-hidden
            cursor-pointer
            transition
            ${
                isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/40 hover:bg-secondary/60"
            }
          `}
                                                >
                                                    {/* Hidden File Input */}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target
                                                                    .files?.[0];
                                                            if (!file) return;
                                                            handleFileValidation(
                                                                file,
                                                                field
                                                            );
                                                        }}
                                                    />

                                                    {previewUrl ? (
                                                        <>
                                                            <img
                                                                src={previewUrl}
                                                                alt="Avatar preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                                                                <span className="text-white text-xs">
                                                                    Change
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center text-muted-foreground px-2">
                                                            <Upload
                                                                size={24}
                                                                className="mx-auto mb-2"
                                                            />
                                                            <p className="text-xs font-medium">
                                                                Click or Drag
                                                            </p>
                                                            <p className="text-[10px] mt-1">
                                                                JPG, PNG, WEBP
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Supplier Information Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Information</CardTitle>
                                <CardDescription>
                                    Supplier role and supply categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Role */}
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel label="Supplier Role" />
                                            </FormLabel>
                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={(val) =>
                                                    field.onChange(
                                                        val || undefined
                                                    )
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(
                                                        SupplierRoleNames
                                                    ).map((role) => (
                                                        <SelectItem
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {formatEnumValue(
                                                                role
                                                            )}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Supply Categories */}
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel label="Supply Categories" />{" "}
                                                &#40;Select at least one&#41;
                                            </FormLabel>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                                {Object.values(
                                                    SupplierSupplyCategories
                                                ).map((category) => (
                                                    <FormField
                                                        key={category}
                                                        control={form.control}
                                                        name="type"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center gap-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(
                                                                            category
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            const current =
                                                                                field.value ||
                                                                                [];
                                                                            field.onChange(
                                                                                checked
                                                                                    ? [
                                                                                          ...current,
                                                                                          category,
                                                                                      ]
                                                                                    : current.filter(
                                                                                          (
                                                                                              item
                                                                                          ) =>
                                                                                              item !==
                                                                                              category
                                                                                      )
                                                                            );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <Label className="font-normal cursor-pointer">
                                                                    {formatEnumValue(
                                                                        category
                                                                    )}
                                                                </Label>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Company */}
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <OptionalLabel label="Company/Enterprise" />
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter company/enterprise name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the company/enterprise if
                                                this supplier belongs to a
                                                specific company/enterprise
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create Supplier"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
