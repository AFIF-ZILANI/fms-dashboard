"use client";

import * as React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/app/generated/prisma/enums";

export type ActorSearchItem = {
    id: string;
    name: string;
    type: UserRole;
};

interface ActorSelectAsyncProps {
    value?: string;
    onChange: (value: string) => void;
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

export function ActorSelectAsync({
    onChange,
    type,
    value,
}: ActorSelectAsyncProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [items, setItems] = React.useState<ActorSearchItem[]>([]);
    const [loading, setLoading] = React.useState(false);

    // debounce API search
    React.useEffect(() => {
        if (query.length < 2) {
            setItems([]);
            return;
        }

        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/get/actors/search?q=${encodeURIComponent(query)}&cat=${type}`
                );
                const json = await res.json();
                setItems(json.data ?? []);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(t);
    }, [query]);

    // console.log("Current Selection", items);

    return (
        <Select
            open={open}
            value={value}
            onOpenChange={setOpen}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Find.." />
            </SelectTrigger>

            <SelectContent>
                {/* Search input – letters stay visible */}
                <div className="p-2 border-b">
                    <Input
                        autoFocus
                        placeholder="Type name…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {loading && (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching…
                    </div>
                )}

                {!loading && items.length === 0 && query.length >= 2 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                        No results
                    </div>
                )}

                {items.map((item) => (
                    <SelectItem
                        key={`${item.type}-${item.id}`}
                        value={item.id}
                        className="flex justify-between items-center"
                    >
                        <span>{item.name}</span>
                        <Badge variant="secondary">
                            {typeLabel[item.type]}
                        </Badge>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
