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
import { Search } from "lucide-react";
import { UserRole } from "@/app/generated/prisma/enums";
import { formatEnums } from "@/lib/strings";
import { Skeleton } from "./ui/skeleton";

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

// export function ActorSelectAsync({
//     onChange,
//     type,
//     value,
// }: ActorSelectAsyncProps) {
//     const [open, setOpen] = React.useState(false);
//     const [query, setQuery] = React.useState("");
//     const [items, setItems] = React.useState<ActorSearchItem[]>([]);
//     const [loading, setLoading] = React.useState(false);

//     // debounce API search
//     React.useEffect(() => {
//         if (query.length < 2) {
//             setItems([]);
//             return;
//         }

//         const t = setTimeout(async () => {
//             setLoading(true);
//             try {
//                 const res = await fetch(
//                     `/api/get/actors/search?q=${encodeURIComponent(query)}&cat=${type}`
//                 );
//                 const json = await res.json();
//                 setItems(json.data ?? []);
//             } catch {
//                 setItems([]);
//             } finally {
//                 setLoading(false);
//             }
//         }, 300);

//         return () => clearTimeout(t);
//     }, [query, type]);

//     // console.log("Current Selection", items);

//     return (
//         <Select
//             open={open}
//             value={value}
//             onOpenChange={setOpen}
//             onValueChange={onChange}
//         >
//             <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Find.." />
//             </SelectTrigger>

//             <SelectContent>
//                 {/* Search input – letters stay visible */}
//                 <div className="p-2 border-b">
//                     <Input
//                         autoFocus
//                         placeholder="Type name…"
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                     />
//                 </div>

//                 {loading && (
//                     <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Searching…
//                     </div>
//                 )}

//                 {!loading && items.length === 0 && query.length >= 2 && (
//                     <div className="px-3 py-2 text-sm text-muted-foreground">
//                         No results
//                     </div>
//                 )}

//                 {items.map((item) => (
//                     <SelectItem
//                         key={`${item.type}-${item.id}`}
//                         value={item.id}
//                         className="flex justify-between items-center"
//                     >
//                         <span>{item.name}</span>
//                         <Badge variant="secondary">
//                             {formatEnums(item.type)}
//                         </Badge>
//                     </SelectItem>
//                 ))}
//             </SelectContent>
//         </Select>
//     );
// }

export function ActorSelectAsync({
    onChange,
    type,
    value,
}: ActorSelectAsyncProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [items, setItems] = React.useState<ActorSearchItem[]>([]);
    const [loading, setLoading] = React.useState(false);

    // debounce search with mock data
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
    }, [query, type]);

    return (
        <Select
            open={open}
            value={value}
            onOpenChange={setOpen}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Search actors..." />
            </SelectTrigger>

            <SelectContent className="w-full">
                {/* Search input */}
                <div className="sticky top-0 bg-background p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            autoFocus
                            placeholder="Search by name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Loading state with skeletons */}
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

                {/* No results state */}
                {!loading && items.length === 0 && query.length >= 2 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                            No {type.toLocaleLowerCase()} found
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Try searching with a different name
                        </p>
                    </div>
                )}

                {/* Empty search state */}
                {!loading && items.length === 0 && query.length < 2 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <Search className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Type at least 2 characters to search
                        </p>
                    </div>
                )}

                {/* Results */}
                {!loading && items.length > 0 && (
                    <div className="max-h-80 overflow-y-auto">
                        {items.map((item) => (
                            <SelectItem
                                key={`${item.type}-${item.id}`}
                                value={item.id}
                                className="cursor-pointer hover:bg-accent transition-colors flex items-center justify-between"
                            >
                                <span className="text-sm">{item.name}</span>
                                <Badge variant="secondary" className="ml-2">
                                    {formatEnums(item.type as UserRole)}
                                </Badge>
                            </SelectItem>
                        ))}
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
