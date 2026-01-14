"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { paymentInstrumentSchema } from "@/schemas/payment.schem";
import { UserRole, PaymentMethod, MfsType } from "@/app/generated/prisma/enums";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { RefreshCcw, Save } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useGetData, usePostData } from "@/lib/api-request";
import { ActorSearchAsync } from "../actor-search";
import { ActorSearchItem } from "@/types";
import { toast } from "sonner";

type PaymentInstrumentForm = z.infer<typeof paymentInstrumentSchema>;

export function AddPaymentInstrumentDialog() {
    const [owner, setOwner] = useState<ActorSearchItem | null>(null);
    const {
        isError,
        isPending: submitIsPending,
        isSuccess,
        error,
        mutate,
    } = usePostData("/create/payment/instrument");
    const [open, setOpen] = useState(false);

    const form = useForm<PaymentInstrumentForm>({
        resolver: zodResolver(paymentInstrumentSchema),
        defaultValues: {
            ownerType: undefined,
            ownerId: undefined,
            type: PaymentMethod.CASH,
            label: "",
            bankName: "",
            accountNo: "",
            mobileNo: "",
            mfsType: undefined,
        },
    });

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (isSuccess) {
            toast.success("Payment Instrument saved successfully!");
            form.reset();
            setOpen(false);
        }

        if (isError && error) {
            toast.error(error.message || "Failed to save payment instrument");
        }
    }, [isSuccess, isError, error, form]);

    const watchType = form.watch("type");
    const watchOwnerType = form.watch("ownerType");

    const onSubmit = async (values: PaymentInstrumentForm) => {
        mutate(values);
    };

    useEffect(() => {
        form.setValue("ownerId", owner?.id || "");
    }, [owner]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">+ Payment Instrument</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Payment Instrument</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Owner Type */}
                        <FormField
                            control={form.control}
                            name="ownerType"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Owner Type</Label>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(UserRole).map(
                                                    (i) => (
                                                        <SelectItem
                                                            key={i}
                                                            value={i}
                                                        >
                                                            {i}
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
                        <FormField
                            control={form.control}
                            name="ownerId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Owner</Label>
                                    <FormControl>
                                        <ActorSearchAsync
                                            onSelect={(item) => {
                                                field.onChange(item.id);
                                            }}
                                            type={watchOwnerType}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Instrument Type</Label>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(
                                                    PaymentMethod
                                                ).map((t) => (
                                                    <SelectItem
                                                        key={t}
                                                        value={t}
                                                    >
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Label */}
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Label</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: Dutch Bangla A/C"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Bank Fields */}
                        {watchType === PaymentMethod.BANK_TRANSFER && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="bankName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Bank Name</Label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Ex: Dutch Bangla Bank"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accountNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Account No</Label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="1234567890"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {/* Mobile Fields */}
                        {watchType === PaymentMethod.MFS && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="mfsType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>MFS Type</Label>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select MFS" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(
                                                            MfsType
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
                                <FormField
                                    control={form.control}
                                    name="mobileNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Mobile Number</Label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="01XXXXXXXXX"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

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

                                {submitIsPending ? "Saving" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
