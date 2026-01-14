"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseLine } from "@/types/purchase";

type Props = {
  data: PurchaseLine[];
  onChange: (data: PurchaseLine[]) => void;
};

export function PurchaseItemsTable({ data, onChange }: Props) {
  const updateRow = (index: number, key: keyof PurchaseLine, value: any) => {
    const copy = [...data];
    // @ts-ignore
    copy[index][key] = value;
    onChange(copy);
  };

  const columns: ColumnDef<PurchaseLine>[] = [
    {
      header: "Item",
      accessorKey: "name",
    },
    {
      header: "Qty",
      cell: ({ row }) => (
        <Input
          type="number"
          value={row.original.quantity}
          onChange={(e) =>
            updateRow(row.index, "quantity", Number(e.target.value))
          }
          className="w-20"
        />
      ),
    },
    {
      header: "Unit",
      accessorKey: "unit",
    },
    {
      header: "Unit Price",
      cell: ({ row }) => (
        <Input
          type="number"
          value={row.original.unitPrice}
          onChange={(e) =>
            updateRow(row.index, "unitPrice", Number(e.target.value))
          }
          className="w-24"
        />
      ),
    },
    {
      header: "Total",
      cell: ({ row }) => {
        const t = row.original.quantity * row.original.unitPrice;
        return <span className="font-medium">{t.toFixed(2)}</span>;
      },
    },
    {
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() =>
            onChange(data.filter((_, i) => i !== row.index))
          }
        >
          ✕
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="p-2 text-left">
                  {h.column.columnDef.header as string}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {cell.renderCell()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
