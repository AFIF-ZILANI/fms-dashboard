"use client";

import { Plus, RefreshCcw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HouseType } from "@/app/generated/prisma/enums";
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

import { addHouseSchema, AddHouseSchema } from "@/schemas/house.schema";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";

export function AddHouseDialog() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm<AddHouseSchema>({
        resolver: zodResolver(addHouseSchema),
        defaultValues: {
            houseNumber: 0,
            name: "",
            type: undefined,
        },
    });

    const {
        mutate,
        isPending: submitIsPending,
        isSuccess,
        isError,
        error,
    } = usePostData("/houses/add");

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("House added successfully!");
            form.reset();
            // setDialogOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to add house");
        }
    }, [isSuccess, isError, error, form]);

    const onSubmit = (values: AddHouseSchema) => {
        console.log(values);
        mutate(values);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-[150px] shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
                    role="menuitem"
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">New House</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="px-4 mt-1 bg-background">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Add new house</DialogTitle>
                            <DialogDescription>
                                Provide details to register a new house
                            </DialogDescription>
                        </DialogHeader>

                        {/* House Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>House Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="House A"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* House Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>House Type</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select house type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(HouseType).map(
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

                        {/* House Number */}
                        <FormField
                            control={form.control}
                            name="houseNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>House Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            pattern="[0-9]*"
                                            className="pr-12"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Allow only digits
                                                if (/^\d*$/.test(val)) {
                                                    field.onChange(
                                                        val === ""
                                                            ? ""
                                                            : Number(val)
                                                    );
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="grid grid-cols-2 gap-4 mt-4 md:mt-6">
                            {/* Form Reset */}
                            <Button
                                variant={"outline"}
                                onClick={() => form.reset()}
                            >
                                <RefreshCcw />
                                Reset
                            </Button>
                            {/* Submit */}
                            <Button type="submit" disabled={submitIsPending}>
                                {submitIsPending ? <Spinner /> : <Save />}

                                {submitIsPending ? "Adding" : "Add House"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
