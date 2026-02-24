"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { AddWeightRecordDialog } from "@/components/fab-dialogs/add-weight-dialog";
import { AddHouseDialog } from "@/components/fab-dialogs/add-house-dialog";
import { AddEventDialog } from "@/components/fab-dialogs/add-event-dialog";
import { AddBatchDialog } from "@/components/fab-dialogs/add-batch-dialog";
import { AddBatchAllocationDialog } from "@/components/fab-dialogs/add-batch-allocation.dialog";

export default function FAB() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    useEffect(() => {
        const id = setTimeout(() => setOpen(false), 0);
        return () => clearTimeout(id);
    }, [pathname]);

    // // Close on escape key
    // useEffect(() => {
    //     const handleEscape = (e: KeyboardEvent) => {
    //         if (e.key === "Escape" && open) {
    //             setOpen(false);
    //         }
    //     };

    //     document.addEventListener("keydown", handleEscape);
    //     return () => document.removeEventListener("keydown", handleEscape);
    // }, [open]);

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-200 ${
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Action menu */}
            <div
                className={`fixed bottom-24 right-4 md:right-6 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${
                    open
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
                role="menu"
                aria-label="Quick actions menu"
                aria-hidden={!open}
            >
                <div
                    className={`transition-all duration-300 ease-out ${
                        open
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    } space-y-2 flex flex-col`}
                >
                    <AddBatchDialog />
                    <AddEventDialog />
                    <AddBatchAllocationDialog />
                    <AddWeightRecordDialog />
                    <AddHouseDialog />
                </div>
            </div>

            {/* Main FAB toggle button */}
            <Button
                size="icon"
                onClick={() => setOpen(!open)}
                className={`fixed bottom-4 right-4 md:right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    open ? "rotate-45" : "rotate-0"
                }`}
                aria-label={
                    open
                        ? "Close quick actions menu"
                        : "Open quick actions menu"
                }
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <Plus className="h-6 w-6 transition-transform duration-300" />
            </Button>
        </>
    );
}
