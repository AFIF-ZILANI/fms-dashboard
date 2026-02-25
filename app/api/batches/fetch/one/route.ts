import { EventType } from "@/app/generated/prisma/enums";
import { errorResponse, response } from "@/lib/apiResponse";
import { getBatchAgeInDays } from "@/lib/date-time";
import { throwError } from "@/lib/error";
import prisma from "@/lib/prisma";
import { BatchProfileData } from "@/types/api";
import { NextRequest } from "next/server";

// type WeeklyWeight = {
//     week: number;
//     age: number;
//     houseId: number;
//     avgWeight: number; // grams
//     sampleSize: number;
// };

type WeightData = {
    avgWeight: number;
    sampleSize: number;
};

// const weightByWeek = new Map<number, WeightData>();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const batchId = searchParams.get("batchId");
        const now = new Date();

        if (!batchId) {
            throwError({
                message: "batchId is required",
                statusCode: 400,
            });
        }
        const [batch, events, suppliers, weightRec, allocations] =
            await Promise.all([
                prisma.batches.findFirst({
                    where: { id: batchId },
                }),

                prisma.houseEvents.findMany({
                    where: { batch_id: batchId },
                    orderBy: { occurred_at: "asc" },
                }),

                prisma.batchSuppliers.findMany({
                    where: { batch_id: batchId },
                    include: {
                        supplier: {
                            include: {
                                profile: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                }),

                prisma.weightRecords.findMany({
                    where: { batch_id: batchId },
                    orderBy: { created_at: "asc" }, // should already be measured on day 4, 11, 18...
                }),
                prisma.batchHouseAllocation.findMany({
                    where: { batch_id: batchId },
                }),
            ]);

        if (!batch) {
            throwError({
                message: "Batch not found",
                statusCode: 404,
            });
        }

        // ---------- BASE DATA ----------
        const data: BatchProfileData = {
            batchId: batch.id,
            batch_bussiness_id: batch.batch_id,
            phase: batch.phase,
            age: getBatchAgeInDays(batch.starting_date),
            breed: batch.breed,
            initialQuantity: batch.initial_quantity,
            batchStart: batch.starting_date,
            expectedSell: batch.expected_selling_date,
            supplier: suppliers.map((s) => s.supplier.profile.name),
            avgBodyWeightLatest: 0,
            mortalityToday: 0,
            numberOfSeriousDeseasesHappen: null,
            mortality24H: 0,
            mortality48H: 0,
            mortality72H: 0,
            daysToSell: batch.expected_selling_date
                ? Math.max(
                    0,
                    Math.ceil(
                        (batch.expected_selling_date.getTime() -
                            now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                )
                : 0,

            totalAliveBirdsGenaral: 0,
            totalMortalityGenaral: 0,
            totalFeedGenaral: 0,
            mortalityRateGenaral: 0,

            genaralFcr: 0,
            genralAliveBirds: [],
            genaralBodyWeight: [],
            genaralMortality: [],
            genaralFeed: [],
            genaralWater: [],
            genaralFeedAndWater: [],

            totalAliveBirdsPerHouse: 0,
            totalFeedPerHouse: 0,
            totalMortalityPerHouse: 0,
            mortalityRatePerHouse: 0,

            fcrPerHouse: [],
            feedPerHouse: [],
            mortalityPerHouse: [],
            aliveBirdsPerHouse: [],
            bodyWeightPerHouse: [],
            waterPerHouse: [],
        };

        // const maxAge = getMaxAge(batch.starting_date, new Date());
        const batchAge = getBatchAgeInDays(batch.starting_date);

        const initialBirdsPerHouse = new Map<string, number>();

        for (const a of allocations) {
            initialBirdsPerHouse.set(a.to_house_id!, a.quantity);
        }

        const mortalityByHouseAge = new Map<string, number>();
        const mortalityByHouseWeek = new Map<string, number>();
        const mortalityByAge = new Map<number, number>();
        const mortalityByWeek = new Map<number, number>();
        const mortalityByHouseSum = new Map<string, number>();

        const feedByHouseAge = new Map<string, number>();
        const feedByAge = new Map<number, number>();
        const feedByHouseSum = new Map<string, number>();

        const waterByHouseAge = new Map<string, number>();
        const waterByAge = new Map<number, number>();
        const waterByHouseSum = new Map<string, number>();

        for (const e of events) {
            const thatAge = getBatchAgeInDays(
                batch.starting_date,
                e.occurred_at
            );

            console.log(thatAge)
            console.log(e)

            if (e.event_type === EventType.MORTALITY) {
                const qty = e.quantity ?? 0;
                const week = Math.ceil(thatAge / 7);
                const dayKey = `${e.house_id}:${thatAge}`;
                const weekKey = `${e.house_id}:${week}`;

                mortalityByHouseAge.set(
                    dayKey,
                    (mortalityByHouseAge.get(dayKey) ?? 0) + qty
                );
                mortalityByHouseWeek.set(
                    weekKey,
                    (mortalityByHouseWeek.get(weekKey) ?? 0) + qty
                );
                mortalityByWeek.set(
                    week,
                    (mortalityByWeek.get(week) ?? 0) + qty
                );
                mortalityByHouseSum.set(
                    e.house_id,
                    (mortalityByHouseSum.get(e.house_id) ?? 0) + qty
                );
                mortalityByAge.set(
                    thatAge,
                    (mortalityByAge.get(thatAge) ?? 0) + qty
                );
            }

            if (e.event_type === EventType.FEED) {
                const qty = e.quantity ?? 0;
                const dayKey = `${e.house_id}:${thatAge}`;

                feedByHouseAge.set(
                    dayKey,
                    (feedByHouseAge.get(dayKey) ?? 0) + qty
                );
                feedByHouseSum.set(
                    e.house_id,
                    (feedByHouseSum.get(e.house_id) ?? 0) + qty
                );
                feedByAge.set(thatAge, (feedByAge.get(thatAge) ?? 0) + qty);
            }

            if (e.event_type === EventType.WATER) {
                const qty = e.quantity ?? 0;
                const dayKey = `${e.house_id}:${thatAge}`;

                waterByHouseAge.set(
                    dayKey,
                    (waterByHouseAge.get(dayKey) ?? 0) + qty
                );
                waterByHouseSum.set(
                    e.house_id,
                    (waterByHouseSum.get(e.house_id) ?? 0) + qty
                );
                waterByAge.set(thatAge, (waterByAge.get(thatAge) ?? 0) + qty);
            }
        }

        const weightByHouseAge = new Map<string, WeightData>();
        const weightByAge = new Map<number, WeightData>();
        const weightByWeek = new Map<number, WeightData>();

        for (const w of weightRec) {
            const wt = w.average_wt_grams.toNumber() ?? 0;

            const thatAge =
                getBatchAgeInDays(batch.starting_date, w.farm_date as Date) ?? 0;
            const week = Math.ceil(thatAge / 7);
            const key = `${w.house_id}:${thatAge}`;

            weightByHouseAge.set(key, {
                avgWeight: wt,
                sampleSize: w.sample_size,
            });

            const prev = weightByWeek.get(week);

            weightByWeek.set(
                week,
                prev
                    ? {
                        avgWeight:
                            (prev.avgWeight * prev.sampleSize +
                                wt * w.sample_size) /
                            (prev.sampleSize + w.sample_size),
                        sampleSize: prev.sampleSize + w.sample_size,
                    }
                    : {
                        avgWeight: wt,
                        sampleSize: w.sample_size,
                    }
            );

            const existing = weightByAge.get(thatAge);

            if (existing) {
                // Calculate new weighted average
                const totalWeight =
                    existing.avgWeight * existing.sampleSize +
                    wt * w.sample_size;
                const totalSize = existing.sampleSize + w.sample_size;

                weightByAge.set(thatAge, {
                    avgWeight: totalWeight / totalSize,
                    sampleSize: totalSize,
                });
            } else {
                // Initialize the first entry for this age
                weightByAge.set(thatAge, {
                    avgWeight: wt,
                    sampleSize: w.sample_size,
                });
            }
        }

        const aliveByHouseAge = new Map<string, number>();
        const aliveByHouse = new Map<string, number>();
        const aliveByAge = new Map<number, number>();

        for (const [houseId, initial] of initialBirdsPerHouse.entries()) {
            let alive = initial;

            for (let age = 1; age <= batchAge; age++) {
                const key = `${houseId}:${age}`;
                const mortalityToday = mortalityByHouseAge.get(key) ?? 0;

                if (mortalityToday > alive) {
                    throw new Error(`Mortality exceeds alive birds`);
                }

                alive -= mortalityToday;

                // alive per house per age
                aliveByHouseAge.set(key, alive);

                // total alive across houses per age
                aliveByAge.set(age, (aliveByAge.get(age) ?? 0) + alive);
            }

            // final/current alive per house
            aliveByHouse.set(houseId, alive);
        }
        const weeks = new Set([
            ...weightByWeek.keys(),
            ...mortalityByWeek.keys(),
        ]);
        const weeksArray = [...weeks].sort((a, b) => a - b);

        let weightLost = 0;

        for (const week of weeksArray) {
            const mortality = mortalityByWeek.get(week) ?? 0;
            const avgWeight = weightByWeek.get(week)?.avgWeight ?? 0;

            weightLost += mortality * (avgWeight / 1000);

            // console.log(weightLost);
        }

        // data feeding

        data.mortalityPerHouse = Array.from(
            mortalityByHouseAge,
            ([key, mortality]) => {
                const [houseId, age] = key
                    .split(":")
                    .map((val) => Number.parseInt(val, 10));
                return { houseId, day: age, mortality };
            }
        );
        data.feedPerHouse = Array.from(feedByHouseAge, ([key, feed]) => {
            const [houseId, age] = key
                .split(":")
                .map((val) => Number.parseInt(val, 10));
            return { houseId, age, feed };
        });
        data.waterPerHouse = Array.from(waterByHouseAge, ([key, water]) => {
            const [houseId, age] = key
                .split(":")
                .map((val) => Number.parseInt(val, 10));
            return { houseId, age, water };
        });
        data.bodyWeightPerHouse = Array.from(
            weightByHouseAge,
            ([key, data]) => {
                const [houseId, age] = key
                    .split(":")
                    .map((val) => Number.parseInt(val, 10));
                return {
                    houseId,
                    age,
                    sampleSize: data.sampleSize,
                    avgWeight: data.avgWeight,
                    week: Math.ceil(age),
                };
            }
        );

        // data.aliveBirdsPerHouse =

        // Genaral Data
        const ages = new Set([...feedByAge.keys(), ...waterByAge.keys()]);

        const genaralFeedAndWater: {
            age: number;
            feed: number;
            water: number;
        }[] = Array.from(ages).map((age) => ({
            age,
            feed: feedByAge.get(age) ?? 0,
            water: waterByAge.get(age) ?? 0,
        }));
        data.genaralFeedAndWater = genaralFeedAndWater;
        data.genaralFeed = Array.from(feedByAge, ([age, feed]) => ({
            age,
            feed,
        }));
        data.genaralBodyWeight = Array.from(weightByAge, ([age, data]) => ({
            age,
            week: Math.ceil(age / 7),
            sampleSize: data.sampleSize,
            avgWeight: data.avgWeight,
        }));
        data.genaralMortality = Array.from(
            mortalityByAge,
            ([age, mortality]) => ({ day: age, mortality })
        );

        data.genaralWater = Array.from(waterByAge, ([age, water]) => ({
            age,
            water,
        }));

        data.genralAliveBirds = getGenaralAliveBirds(
            batch.initial_quantity,
            batchAge,
            mortalityByAge
        );

        data.totalMortalityGenaral = mortalityByAge
            .entries()
            .reduce((acc, val) => (acc += val[1]), 0);
        data.totalFeedGenaral = feedByAge
            .entries()
            .reduce((acc, val) => (acc += val[1]), 0);
        data.totalAliveBirdsGenaral =
            aliveByAge.get(getBatchAgeInDays(batch.starting_date)) ?? 0;

        data.mortalityRateGenaral =
            (data.totalMortalityGenaral / batch.initial_quantity) * 100;
        data.mortalityToday = mortalityByAge.get(batchAge) ?? 0;
        let latestAvgBodyWeight: number = 0;
        if (weightByAge.size > 0) {
            let maxAge = -Infinity;

            for (const [age, data] of weightByAge.entries()) {
                if (age > maxAge) {
                    maxAge = age;
                    latestAvgBodyWeight = data.avgWeight;
                }
            }
        }

        data.avgBodyWeightLatest = latestAvgBodyWeight;

        const currentBirdsBodyWeight =
            data.totalAliveBirdsGenaral * (data.avgBodyWeightLatest / 1000);
        const currentBirdsInitialBodyWeight =
            data.totalAliveBirdsGenaral * (batch.init_chicks_avg_wt / 1000);

        const netWeight =
            currentBirdsBodyWeight - currentBirdsInitialBodyWeight - weightLost;
        const fcr = netWeight > 0 ? data.totalFeedGenaral / netWeight : 0;

        data.genaralFcr = fcr;

        const growthRate =
            (data.avgBodyWeightLatest - (weightByWeek.get(2)?.avgWeight ?? 0)) /
            7;

        console.log(growthRate);
        console.log();

        // console.log(mortalityByHouseWeek);
        // console.log(mortalityByHouseAge);
        // console.log(mortalityByHouseSum);
        // console.log(mortalityByAge);

        // console.log(feedByHouseAge);
        // console.log(feedByHouseSum);
        // console.log(feedByAge);

        // console.log(waterByHouseAge);
        // console.log(waterByHouseSum);
        // console.log(waterByAge);

        // console.log(weightByHouseAge);
        // console.log(weightByAge);

        // console.log(aliveByHouseAge);
        // console.log(aliveByAge);
        // console.log(aliveByHouse);
        // console.log(weeksArray);
        // console.log(weightLost);
        // console.log(weightByWeek);
        console.log(data)
        return response({
            message: "Batch profile fetched successfully",
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

// function getFinalAvgWeight(
//     weights: {
//         week: number;
//         houseId: number;
//         age: number;
//         avgWeight: number;
//     }[],
//     houseId: number
// ) {
//     const houseWeights = weights.filter((w) => w.houseId === houseId);
//     if (!houseWeights.length) return 0;

//     return houseWeights.reduce((latest, curr) =>
//         curr.week > latest.week ? curr : latest
//     ).avgWeight;
// }

// function getLiveWeightGainPerHouse(
//     houseId: number,
//     alivebirdsPerHouse: { houseId: number; alive: number }[],
//     WeightsPerWeekPerHouse: WeeklyWeight[],
//     initialChicksWeight: number
// ) {
//     const aliveEntry = alivebirdsPerHouse.find((h) => h.houseId === houseId);
//     if (!aliveEntry) return 0;

//     const finalAvgWeight = getFinalAvgWeight(WeightsPerWeekPerHouse, houseId);

//     return (finalAvgWeight - initialChicksWeight) * aliveEntry.alive;
// }

// function getDeadWeightLoss(
//     houseId: number,
//     lostWeightPerWeekPerHouse: {
//         houseId: number;
//         weightLost: number;
//     }[]
// ) {
//     return lostWeightPerWeekPerHouse
//         .filter((l) => l.houseId === houseId)
//         .reduce((sum, l) => sum + l.weightLost, 0);
// }

function getGenaralAliveBirds(
    initialBirds: number,
    maxAge: number,
    mortalityByAge: Map<number, number>
) {
    const aliveBirds: { age: number; alive: number }[] = [];
    let alive = initialBirds;

    for (let age = 1; age <= maxAge; age++) {
        const mortalityToday = mortalityByAge.get(age) ?? 0;

        if (mortalityToday > alive) {
            throw new Error(`Mortality exceeds alive birds`);
        }

        alive -= mortalityToday;

        aliveBirds.push({
            age,
            alive,
        });
    }

    return aliveBirds;
}

// function addWeightForWeek(week: number, avgWeight: number, sampleSize: number) {
//     const existing = weightByWeek.get(week);

//     if (!existing) {
//         // first entry for this week
//         weightByWeek.set(week, { avgWeight, sampleSize });
//         return;
//     }

//     const totalWeight =
//         existing.avgWeight * existing.sampleSize + avgWeight * sampleSize;

//     const totalSampleSize = existing.sampleSize + sampleSize;

//     weightByWeek.set(week, {
//         avgWeight: totalWeight / totalSampleSize,
//         sampleSize: totalSampleSize,
//     });
// }


export function calculateADG(prev: number, curr: number): number {
    const days = 7;

    if (days !== 7) {
        throw new Error("Weekly weight must be exactly 7 days apart");
    }

    return (curr - prev) / days;
}
