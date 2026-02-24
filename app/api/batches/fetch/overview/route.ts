import { errorResponse, response } from "@/lib/apiResponse";
import {
    getFeedConsumedToday,
    getMortalitiesToday,
    getPhaseByAge,
    getWaterConsumedToday,
} from "@/lib/bird-man";
import { getBatchAgeInDays } from "@/lib/date-time";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { BatchOverviewData, BatchSpecific } from "@/types/api";

export async function GET() {
    try {
        const data: BatchOverviewData = {
            todaysData: {
                feedConsumed: 0,
                mortality: 0,
                waterConsumed: 0,
                aliveBirds: 0, // end-of-day
                activeBatches: 0,
                mortalityRate: null, // %
                waterFeedRatio: null,
            },
            batchSpecificData: [],
        };

        // Fetch active batches
        const batches = await prisma.batches.findMany({
            where: { status: "RUNNING" },
        });

        if (!batches.length) {
            throwError({
                message: "No active batches",
                statusCode: 400,
            });
        }

        const batchIds = batches.map((b) => b.id);

        // Fetch all related events in one query
        const events = await prisma.houseEvents.findMany({
            where: {
                batch_id: { in: batchIds },
            },
        });

        let aliveAtStartOfTodayCARB = 0;

        for (const batch of batches) {
            const birdAge = getBatchAgeInDays(batch.starting_date);
            const target: BatchSpecific = {
                batch_bussiness_id: batch.batch_id,
                batchId: batch.id,
                birdsAge: getBatchAgeInDays(batch.starting_date),
                feedConsumedToday: 0,
                waterConsumedToday: 0,
                aliveBirds: 0,
                mortalityToday: 0,
                phase: null,
            };

            const batchEvents = events.filter((e) => e.batch_id === batch.id);

            // const feeds = batchEvents.filter((e) => e.event_type === "FEED");
            const mortalities = batchEvents.filter(
                (e) => e.event_type === "MORTALITY"
            );

            // TOTAL mortality (lifetime)
            const totalMortality = mortalities.reduce(
                (sum, e) => sum + (e.quantity ?? 0),
                0
            );

            // TODAY mortality
            target.mortalityToday = getMortalitiesToday(batchEvents);

            // Alive at END of today
            target.aliveBirds = batch.initial_quantity - totalMortality;

            // Alive at START of today (for mortality rate)
            const aliveStartOfDay =
                batch.initial_quantity -
                (totalMortality - target.mortalityToday);

            aliveAtStartOfTodayCARB += aliveStartOfDay;

            // Feed
            target.feedConsumedToday = getFeedConsumedToday(batchEvents);

            // Water
            target.waterConsumedToday = getWaterConsumedToday(batchEvents);

            target.phase = getPhaseByAge(birdAge);
            target.birdsAge = birdAge;

            data.batchSpecificData.push(target);
        }

        // ---- CARB AGGREGATES ----

        data.todaysData.activeBatches = data.batchSpecificData.length;

        data.todaysData.aliveBirds = data.batchSpecificData.reduce(
            (sum, b) => sum + b.aliveBirds,
            0
        );

        data.todaysData.feedConsumed = data.batchSpecificData.reduce(
            (sum, b) => sum + b.feedConsumedToday,
            0
        );

        data.todaysData.waterConsumed = data.batchSpecificData.reduce(
            (sum, b) => sum + b.waterConsumedToday,
            0
        );

        data.todaysData.mortality = data.batchSpecificData.reduce(
            (sum, b) => sum + b.mortalityToday,
            0
        );

        // Mortality rate (%)
        data.todaysData.mortalityRate =
            aliveAtStartOfTodayCARB > 0
                ? (data.todaysData.mortality / aliveAtStartOfTodayCARB) * 100
                : null;

        // Water : Feed ratio
        data.todaysData.waterFeedRatio =
            data.todaysData.feedConsumed > 0
                ? data.todaysData.waterConsumed / data.todaysData.feedConsumed
                : null;

        // console.log(data);

        return response({
            message: "Batch data fetched successfully",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
