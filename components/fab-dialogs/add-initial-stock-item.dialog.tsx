"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Save, Package, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Item } from "@/types/purchase";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { usePostData } from "@/lib/api-request";
import { toast } from "sonner";

export function InitialStockItemForm({ items }: { items: Item[] }) {
    const { isError, isPending, isSuccess, error, mutate } = usePostData(
        "/create/stock/item/initial"
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unitCost, setUnitCost] = useState("");

    const selectedItem = items.find((i) => i.id === selectedItemId);

    const handleNumberInput = (value: any, setter: any) => {
        if (!/^\d*\.?\d*$/.test(value)) return;
        let v = value;
        if (/^0\d+/.test(v)) {
            v = v.replace(/^0+/, "");
        }
        if (v.startsWith(".")) {
            v = "0" + v;
        }
        setter(v);
    };

    const handleSubmit = () => {
        if (!selectedItemId || !quantity) return;
        mutate({
            itemId: selectedItemId,
            quantity,
            date: new Date(),
            unitCost,
        });
    };

    const handleReset = () => {
        setSelectedItemId("");
        setQuantity("");
        setUnitCost("");
    };

    const calculateTotal = () => {
        const qty = Number.parseFloat(quantity) || 0;
        const cost = Number.parseFloat(unitCost) || 0;
        return (qty * cost).toFixed(2);
    };

    useEffect(() => {
        if (isSuccess) {
            toast("Item Added Successfully!")
            handleReset();
        }
        if (isError && !isPending) {
            toast.error(error.message);
        }
    }, [isError, isPending, error]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant={"link"} className="text-muted-foreground">
                    Add Initial Items In Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-800">
                                Add Stock Item
                            </DialogTitle>
                            <p className="text-slate-500 text-sm mt-2">
                                Enter the details for your initial inventory
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">
                            <Package className="inline h-4 w-4 mr-2 text-slate-500" />
                            Select Item
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            value={selectedItemId}
                            onValueChange={setSelectedItemId}
                        >
                            <SelectTrigger className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200">
                                <SelectValue placeholder="Choose an item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} - {item.company} (
                                        {item.category})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedItem && (
                            <Card className="p-3 bg-blue-50 border border-blue-100 animate-in slide-in-from-top duration-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        Unit of measurement:
                                    </span>
                                    <span className="font-semibold text-blue-700 capitalize">
                                        {selectedItem.unit}
                                    </span>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">
                                <Hash className="inline h-4 w-4 mr-2 text-slate-500" />
                                Quantity
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={quantity}
                                onChange={(e) =>
                                    handleNumberInput(
                                        e.target.value,
                                        setQuantity
                                    )
                                }
                                className="px-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                            {selectedItem && quantity && (
                                <p className="text-xs text-slate-500">
                                    {quantity} {selectedItem.unit}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">
                                <span className="scale-110 mr-2 text-slate-500">
                                    ৳
                                </span>
                                Unit Cost
                                <span className="text-slate-400 text-xs ml-2">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={unitCost}
                                onChange={(e) =>
                                    handleNumberInput(
                                        e.target.value,
                                        setUnitCost
                                    )
                                }
                                className="px-4 py-3.5 bg-slate-50 border-2 border-slate-200  focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                            {selectedItem && unitCost && (
                                <p className="text-xs text-slate-500">
                                    per {selectedItem.unit}
                                </p>
                            )}
                        </div>
                    </div>

                    {quantity &&
                        unitCost &&
                        Number.parseFloat(quantity) > 0 &&
                        Number.parseFloat(unitCost) > 0 && (
                            <Card className="p-4 bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-in slide-in-from-bottom duration-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">
                                        Total Cost:
                                    </span>
                                    <span className="text-2xl font-bold text-green-700">
                                        ${calculateTotal()}
                                    </span>
                                </div>
                            </Card>
                        )}
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <Button
                        onClick={() => setDialogOpen(false)}
                        variant="secondary"
                        className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-700  hover:bg-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700  hover:bg-slate-50"
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !selectedItemId || !quantity}
                        className="flex-1 px-6 py-3.5 bg-linear-to-r from-blue-600 to-blue-700 text-white  hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white  animate-spin mr-2" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Add Item
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
