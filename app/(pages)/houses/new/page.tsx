"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
    FormDescription,
} from "@/components/ui/form";

import { addHouseSchema, AddHouseSchema } from "@/schemas/house.schema";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Home, Boxes, Hash } from "lucide-react";
import { HouseType } from "@/app/generated/prisma/enums";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const HOUSE_TYPE_DESCRIPTIONS: Record<
    HouseType,
    { icon: React.ReactNode; description: string }
> = {
    [HouseType.BROODER]: {
        icon: <Home size={20} />,
        description: "Early stage housing (0-21 days)",
    },
    [HouseType.GROWER]: {
        icon: <Boxes size={20} />,
        description: "Growth phase (22-56 days)",
    },
    [HouseType.LAYER]: {
        icon: <Hash size={20} />,
        description: "Laying/Production phase (57+ days)",
    },
};

export default function AddHousePage() {
    const { mutate, isPending } = usePostData("/create/house");
    const router = useRouter();

    const form = useForm<AddHouseSchema>({
        resolver: zodResolver(addHouseSchema),
        defaultValues: {
            name: "",
            type: undefined,
            houseNumber: 1,
        },
        mode: "onChange",
    });

    const onSubmit = async (values: AddHouseSchema) => {
        mutate(values, {
            onSuccess: () => {
                toast.success("House created successfully");
                form.reset();
                router.push("/houses");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    const selectedType = useWatch({
        control: form.control,
        name: "type",
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Home className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">
                            Add New House
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Register a new poultry house to your farm. Fill in the
                        details below to get started.
                    </p>
                </div>

                {/* Main Form Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                        <CardTitle className="text-xl">House Details</CardTitle>
                        <CardDescription>
                            Provide the basic information about your new house
                        </CardDescription>
                    </CardHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6 p-6 sm:p-8"
                        >
                            {/* House Name Section */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Home
                                                size={18}
                                                className="text-primary"
                                            />
                                            <FormLabel className="text-base font-semibold">
                                                House Name
                                            </FormLabel>
                                        </div>
                                        <FormDescription>
                                            A unique identifier for this house
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter house name"
                                                {...field}
                                                className="mt-2 h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* House Type Section */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Boxes
                                                size={18}
                                                className="text-primary"
                                            />
                                            <FormLabel className="text-base font-semibold">
                                                House Type
                                            </FormLabel>
                                        </div>
                                        <FormDescription>
                                            Select the primary use of this house
                                        </FormDescription>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="Choose a house type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(HouseType).map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {
                                                                    HOUSE_TYPE_DESCRIPTIONS[
                                                                        type
                                                                    ]?.icon
                                                                }
                                                                <span className="font-medium">
                                                                    {type}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />

                                        {/* Type Description Card */}
                                        {selectedType && (
                                            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                                                        {
                                                            HOUSE_TYPE_DESCRIPTIONS[
                                                                selectedType as HouseType
                                                            ]?.icon
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-foreground">
                                                            {selectedType}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {
                                                                HOUSE_TYPE_DESCRIPTIONS[
                                                                    selectedType as HouseType
                                                                ]?.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* House Number Section */}
                            <FormField
                                control={form.control}
                                name="houseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Hash
                                                size={18}
                                                className="text-primary"
                                            />
                                            <FormLabel className="text-base font-semibold">
                                                House Number
                                            </FormLabel>
                                        </div>
                                        <FormDescription>
                                            Sequential identifier for tracking
                                            purposes (1-999)
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                min="1"
                                                max="999"
                                                className="mt-2 h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={
                                        isPending || !form.formState.isValid
                                    }
                                >
                                    {isPending ? (
                                        <>
                                            <Spinner />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create House"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </Card>

                {/* Info Callout */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        <span className="font-semibold">Tip:</span> You can edit
                        house details anytime from the houses management page.
                        Make sure to select the correct house type for optimal
                        management features.
                    </p>
                </div>
            </div>
        </div>
    );
}
