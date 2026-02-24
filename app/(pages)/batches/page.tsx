"use client";
import BatchOverviewGrid from "@/components/batch/batch-overview-grid";
import GeneralCardGroup from "@/components/batch/header-kpis";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useGetData } from "@/lib/api-request";
import { BatchOverviewData } from "@/types/api";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
    const { data, isFetching, isError, refetch } = useGetData<{
        data: BatchOverviewData;
    }>(`/batches/fetch/overview`);

    // --- Error Toast ---
    useEffect(() => {
        if (isError) {
            toast.error("Something went wrong. Try again later!");
        }
    }, [isError]);

    // --- Loading State ---
    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="flex items-center gap-2">
                    <Spinner />
                    <span className="text-muted-foreground">
                        Loading batch data
                    </span>
                </div>
            </div>
        );
    }

    // --- Hard Error Fallback (Page Level) ---
    if (isError || !data?.data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <h2 className="text-xl font-semibold">Unable to load batch</h2>
                <p className="text-muted-foreground mt-2">
                    We couldn’t fetch this batch’s data. Try again.
                </p>

                <Button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 rounded bg-primary text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    const batchData: BatchOverviewData = data.data;
    // console.log(batchData);
    return (
        <div className="grid grid-cols-1 md:px-6 px-4">
            <div className="flex flex-col">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Running Batches Snapshot
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        Updated {new Date().toLocaleTimeString()}
                    </span>
                </div>
                <div className="flex justify-between px-2">
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview of key performance indicators for active
                        batches
                    </p>
                    <Button
                        onClick={() => refetch()}
                        variant={"outline"}
                        size={"sm"}
                    >
                        <RefreshCw /> Fresh Data
                    </Button>
                </div>
                <Separator className="my-4" />
            </div>
            <GeneralCardGroup data={batchData.todaysData} />
            <div className="mt-8">
                <BatchOverviewGrid
                    batchSpecificData={batchData.batchSpecificData}
                />
            </div>
        </div>
    );
}
