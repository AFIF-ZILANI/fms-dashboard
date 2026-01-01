import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import Link from "next/link";

export function AddStockItem() {
    return (
        <Link href={"/inventory/new/item"}>
            <Button
                variant="secondary"
                size="sm"
                className="w-[150px] shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
                role="menuitem"
            >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">New Stock Item</span>
            </Button>
        </Link>
    );
}
