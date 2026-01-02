"use client";

import { useState, useMemo } from "react";
import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { PurchaseItem } from "@/types/purchase";
import { PaymentStatus } from "@/app/generated/prisma/enums";


/* ---------------- page ---------------- */

export default function NewPurchasePage() {
    /* Header */
    const [supplierId, setSupplierId] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [invoiceNo, setInvoiceNo] = useState("");
    const [notes, setNotes] = useState("");

    /* Items */
    const [items, setItems] = useState<PurchaseItem[]>([]);

    /* Summary */
    const subtotal = useMemo(
        () => items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
        [items]
    );
    const [discount, setDiscount] = useState(0);
    const [transportCost, setTransportCost] = useState(0);
    const grandTotal = subtotal - discount + transportCost;

    /* Payment */
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("DUE");
    const [paidAmount, setPaidAmount] = useState(0);

    /* ---------------- table ---------------- */

    const columns: ColumnDef<PurchaseItem>[] = [
        {
            id: "item",
            header: "Item",
            cell: ({ row }) => (
                <Input
                    placeholder="Select item"
                    value={row.original.itemName ?? ""}
                    onChange={(e) =>
                        updateRow(row.index, { itemName: e.target.value })
                    }
                />
            ),
        },
        {
            id: "qty",
            header: "Qty",
            cell: ({ row }) => (
                <Input
                    type="number"
                    value={row.original.qty}
                    onChange={(e) =>
                        updateRow(row.index, { qty: Number(e.target.value) })
                    }
                />
            ),
        },
        {
            id: "unit",
            header: "Unit",
            cell: ({ row }) => row.original.unit ?? "-",
        },
        {
            id: "unit_price",
            header: "Unit Price",
            cell: ({ row }) => (
                <Input
                    type="number"
                    value={row.original.unitPrice}
                    onChange={(e) =>
                        updateRow(row.index, {
                            unitPrice: Number(e.target.value),
                        })
                    }
                />
            ),
        },
        {
            id: "line_total",
            header: "Line Total",
            cell: ({ row }) =>
                (row.original.qty * row.original.unitPrice).toFixed(2),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button variant="ghost" onClick={() => removeRow(row.index)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    /* ---------------- handlers ---------------- */
    function addRow() {
        setItems((prev) => [
            ...prev,
            {
                tempId: crypto.randomUUID(),
                qty: 0,
                unitPrice: 0,
            },
        ]);
    }
    function updateRow(index: number, patch: Partial<PurchaseItem>) {
        setItems((prev) =>
            prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
        );
    }

    function removeRow(index: number) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    function savePurchase() {
        if (!supplierId || items.length === 0) {
            alert("Supplier and items are required");
            return;
        }

        // SINGLE API CALL
        console.log({
            supplierId,
            purchaseDate,
            invoiceNo,
            notes,
            items,
            discount,
            transportCost,
            paymentStatus,
            paidAmount,
        });
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <Card className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        placeholder="Supplier"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                    />
                    <Input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                    <Input
                        placeholder="Invoice No"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                    />
                    <Input
                        placeholder="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </Card>

            {/* Items */}
            <Card className="p-4 space-y-3">
                <Button onClick={addRow}>+ Add Item</Button>

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.column.columnDef.header as string}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Summary */}
            <Card className="p-4 w-96 ml-auto space-y-2">
                <div>Subtotal: {subtotal.toFixed(2)}</div>
                <Input
                    type="number"
                    placeholder="Discount"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                />
                <Input
                    type="number"
                    placeholder="Transport Cost"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                />
                <hr />
                <div className="font-bold">
                    Grand Total: {grandTotal.toFixed(2)}
                </div>
            </Card>

            {/* Payment */}
            <Card className="p-4 space-y-3">
                <Select
                    value={paymentStatus}
                    onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="DUE">Due</SelectItem>
                    </SelectContent>
                </Select>

                {paymentStatus !== "DUE" && (
                    <>
                        <Input
                            placeholder="Paid Amount"
                            type="number"
                            value={paidAmount}
                            onChange={(e) =>
                                setPaidAmount(Number(e.target.value))
                            }
                        />
                        <div>
                            Remaining Due:{" "}
                            {(grandTotal - paidAmount).toFixed(2)}
                        </div>
                    </>
                )}
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                <Button onClick={savePurchase}>Save Purchase</Button>
                <Button variant="outline">Cancel</Button>
            </div>
        </div>
    );
}
