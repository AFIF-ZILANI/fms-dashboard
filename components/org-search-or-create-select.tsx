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
import { Loader2, Plus, Search } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { OrganizationRole } from "@/app/generated/prisma/enums";
import { Button } from "./ui/button";
import { toast } from "sonner";

export type Organization = {
    id: string;
    labelName: string;
};

interface OrganizationSelectAsyncProps {
    value?: string | null;
    onChange: (value: string) => void;
    type: OrganizationRole;
    allowCreate?: boolean;
    resetKey?: string | number; // use this instead of isFormSubmit boolean
}

export function OrganizationSelectAsync({
    onChange,
    type,
    value,
    allowCreate = false,
    resetKey,
}: OrganizationSelectAsyncProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [items, setItems] = React.useState<Organization[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [creatingNew, setCreatingNew] = React.useState(false);

    // reset search UI when form resets
    React.useEffect(() => {
        setQuery("");
        setItems([]);
        setOpen(false);
        setLoading(false);
        setCreatingNew(false);
    }, [resetKey]);

    // debounce + abort fetch
    React.useEffect(() => {
        if (query.trim().length < 2) {
            setItems([]);
            return;
        }

        const controller = new AbortController();

        const t = setTimeout(async () => {
            setLoading(true);

            try {
                const res = await fetch(
                    `/api/get/organizations/search?q=${encodeURIComponent(
                        query.trim()
                    )}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error("Failed to fetch organizations");

                const json = await res.json();
                setItems(json.data ?? []);
            } catch (err: unknown) {
                if ((err as Error).name !== "AbortError") {
                    setItems([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 350);

        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [query]);

    const handleCreateOrganization = async () => {
        const name = query.trim();
        if (name.length < 2) return;

        setCreatingNew(true);

        try {
            const res = await fetch("/api/create/stock/item/organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationName: name,
                    type,
                }),
            });

            if (!res.ok) throw new Error("Failed to create organization");

            const json = await res.json();
            const newOrg: Organization | undefined = json.data;

            if (!newOrg?.id) throw new Error("Invalid response from server");

            // update list and select
            setItems([newOrg]);
            onChange(newOrg.id);

            toast.success("Organization created");

            // reset UI
            setQuery("");
            setOpen(false);
        } catch (err: unknown) {
            toast.error(
                (err as Error).message ?? "Failed to create organization"
            );
        } finally {
            setCreatingNew(false);
        }
    };

    return (
        <Select
            open={open}
            value={value ?? undefined}
            onOpenChange={setOpen}
            onValueChange={(val) => {
                onChange(val);
                setOpen(false);
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organization..." />
            </SelectTrigger>

            <SelectContent className="w-full">
                {/* Search Input */}
                <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <div className="relative flex items-center gap-2">
                        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search by name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-8"
                        />

                        {allowCreate && query.trim().length >= 2 && (
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={handleCreateOrganization}
                                disabled={creatingNew}
                                className="shrink-0"
                            >
                                {creatingNew ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>

                    {allowCreate && query.trim().length >= 2 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Click + to create “{query.trim()}”
                        </p>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-9 w-full rounded-md"
                            />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && query.trim().length < 2 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <Search className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Type at least 2 characters to search
                        </p>
                    </div>
                )}

                {/* No results */}
                {!loading && query.trim().length >= 2 && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            No organizations found
                        </p>

                        {allowCreate ? (
                            <p className="text-xs text-muted-foreground mt-1">
                                Click + to create it
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                                Try a different name
                            </p>
                        )}
                    </div>
                )}

                {/* Results */}
                {!loading && items.length > 0 && (
                    <div className="max-h-80 overflow-y-auto">
                        {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.labelName}
                            </SelectItem>
                        ))}
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
