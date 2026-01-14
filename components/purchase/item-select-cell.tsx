"use client";

import { useState } from "react";
import { useItems } from "@/hooks/use-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
    value?: string;
    onSelect: (item: { id: string; name: string; unit: string }) => void;
};

export function ItemSelectCell({ value, onSelect }: Props) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useItems(page);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                    {value ?? "Select Item"}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[360px] p-2 space-y-2">
                <Input placeholder="Search item..." />

                {isLoading && <p className="text-sm">Loading...</p>}

                <div className="max-h-60 overflow-y-auto">
                    {data?.data.map((item: any) => (
                        <button
                            key={item.id}
                            className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                            onClick={() =>
                                onSelect({
                                    id: item.id,
                                    name: item.name,
                                    unit: item.unit,
                                })
                            }
                        >
                            {item.name}
                            <span className="text-xs text-muted-foreground ml-2">
                                ({item.unit})
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between text-sm">
                    <Button
                        variant="ghost"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
