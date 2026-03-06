"use client";

import BatchDetails from "@/components/batch/batch-details";
import ProfileGraph from "@/components/batch/profile-graph";
import ProfileKPIs from "@/components/batch/profile-kpis";
import { ChartEmptyState } from "@/components/empty-chart-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Phase } from "@/config/bird-man.config";
import { useGetData } from "@/lib/api-request";
import { BatchProfileData } from "@/types/api";
import { RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
    const path = usePathname();
    const batchId = path.split("/").pop();

    const { data, isFetching, isError, refetch } = useGetData<{
        data: BatchProfileData;
    }>(`/batches/fetch/one?batchId=${batchId}`);

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

                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 rounded bg-primary text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    const profileData: BatchProfileData = data.data;

    return (
        <div className="grid grid-cols-1 gap-x-4 px-4 md:px-6 gap-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-xl font-semibold tracking-tight">
                    Batch Details
                </h2>
                <div className="flex justify-between">
                    <p className="text-muted-foreground">
                        Comprehensive information about the selected batch
                    </p>
                    <Button variant={"outline"} onClick={() => refetch()}>
                        <RefreshCw />
                        Refetch
                    </Button>
                </div>
            </div>

            {/* BATCH DETAILS */}
            <BatchDetails
                batchId={profileData.batch_bussiness_id}
                phase={profileData.phase as Phase}
                age={profileData.age}
                batchStart={profileData.batchStart}
                expectedSell={profileData.expectedSell}
                initialQuantity={profileData.initialQuantity}
                supplier={profileData.supplier}
                daysToSell={profileData.daysToSell}
                mortality24H={profileData.mortality24H}
                mortality48H={profileData.mortality48H}
                mortality72H={profileData.mortality72H}
                breed={profileData.breed}
            />

            {/* KPIs */}
            <ProfileKPIs
                fcr={profileData.genaralFcr}
                avgBodyWeightLatest={profileData.avgBodyWeightLatest}
                mortalityRate={profileData.mortalityRateGenaral}
                mortalityToday={profileData.mortalityToday}
                totalMortality={profileData.totalMortalityGenaral}
                numberOfSeriousDeseasesHappen={
                    profileData.numberOfSeriousDeseasesHappen
                }
                totalFeedConsumed={profileData.totalFeedGenaral}
                totalAliveBirds={profileData.totalAliveBirdsGenaral}
                isLoading={isFetching}
            />

            {/* GRAPH (Fallback Inside Component) */}
            {profileData ? (
                <ProfileGraph
                    aliveBirdsArray={profileData.genralAliveBirds}
                    mortalityArray={profileData.genaralMortality}
                    feedAndWaterConsumedArray={profileData.genaralFeedAndWater}
                    weightRecord={profileData.genaralBodyWeight}
                />
            ) : (
                <ChartEmptyState message="No chart data available for this batch" />
            )}
        </div>
    );
}
