"use client";

import React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/app/generated/prisma/enums";
import { ActorSearchItem } from "@/types";

interface ActorSearchAsyncProps {
    onSelect: (item: ActorSearchItem) => void;
    type: UserRole;
}

const typeLabel: Record<UserRole, string> = {
    SUPPLIER: "Supplier",
    CUSTOMER: "Customer",
    // TRANSPORTER: "Transporter",
    ADMIN: "Admin",
    DOCTOR: "Doctor",
    EMPLOYEE: "Employee",
};

export function ActorSearchAsync({ onSelect, type }: ActorSearchAsyncProps) {
    const [query, setQuery] = React.useState("");
    const [items, setItems] = React.useState<ActorSearchItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState<ActorSearchItem | null>(
        null
    );

    // debounce
    React.useEffect(() => {
        if (query.length < 2) {
            setItems([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/get/actors/search?q=${encodeURIComponent(query)}&cat=${type}`
                );

                if (!res.ok) throw new Error("Search failed");

                const data = await res.json();
                setItems(data.data);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, type]);

    console.log(items);

    return (
        <Command className="rounded-lg border">
            <CommandInput
                placeholder="Search supplier, customer, admin..."
                value={query}
                onValueChange={setQuery}
            />

            {loading && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                </div>
            )}

            {!loading && items.length === 0 && query.length >= 2 && (
                <CommandEmpty>No results found.</CommandEmpty>
            )}

            <CommandGroup>
                {items &&
                    items.map((item) => (
                        <CommandItem
                            key={`${item.type}-${item.id}`}
                            value={item.name}
                            onSelect={() => {
                                onSelect(item);
                                setSelected(item);
                            }}
                            className={`flex items-center justify-between ${selected && selected.id === item.id ? "bg-muted" : ""}`}
                        >
                            <span>{item.name}</span>
                            <Badge variant="secondary">
                                {typeLabel[item.type]}
                            </Badge>
                        </CommandItem>
                    ))}
            </CommandGroup>
        </Command>
    );
}
