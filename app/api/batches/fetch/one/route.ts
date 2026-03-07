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

        if (!batchId) {
            throwError({
                message: "batchId is required",
                statusCode: 400,
            });
        }

        const now = new Date();

        const [batch, events, suppliers, weightRec, allocations] =
            await Promise.all([
                prisma.batches.findUnique({
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
                    orderBy: { created_at: "asc" },
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
        const batchAge = getBatchAgeInDays(batch.starting_date);
        const data: BatchProfileData = {
            batchId: batch.id,
            batch_bussiness_id: batch.batch_id,
            phase: batch.phase,
            age: batchAge,
            breed: batch.breed,

            initialQuantity: batch.initial_quantity,

            batchStart: batch.starting_date,
            expectedSell: batch.expected_selling_date,

            supplier: suppliers.map(
                (s) => s.supplier?.profile?.name ?? "Unknown"
            ),

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
                        (batch.expected_selling_date.getTime() - now.getTime()) /
                        86400000
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

        const initialBirdsPerHouse = new Map<string, number>();

        for (const allocation of allocations) {
            if (!allocation.to_house_id) continue;

            initialBirdsPerHouse.set(
                allocation.to_house_id,
                allocation.quantity
            );
        }

        const mortalityByAge = new Map<number, number>();
        const mortalityByWeek = new Map<number, number>();
        const mortalityByHouseAge = new Map<string, Map<number, number>>();

        const feedByAge = new Map<number, number>();
        const feedByHouseAge = new Map<string, Map<number, number>>();

        const waterByAge = new Map<number, number>();
        const waterByHouseAge = new Map<string, Map<number, number>>();

        const mortalityByHouseSum = new Map<string, number>();
        const feedByHouseSum = new Map<string, number>();
        const waterByHouseSum = new Map<string, number>();

        for (const e of events) {
            const age = getBatchAgeInDays(batch.starting_date, e.occurred_at);
            const week = Math.ceil(age / 7);
            const qty = e.quantity ?? 0;
            const houseId = e.house_id;

            switch (e.event_type) {

                case EventType.MORTALITY:
                    addToMap(mortalityByAge, age, qty);
                    addToMap(mortalityByWeek, week, qty);
                    addToMap(mortalityByHouseSum, houseId, qty);
                    addNested(mortalityByHouseAge, houseId, age, qty);
                    break;

                case EventType.FEED:
                    addToMap(feedByAge, age, qty);
                    addToMap(feedByHouseSum, houseId, qty);
                    addNested(feedByHouseAge, houseId, age, qty);
                    break;

                case EventType.WATER:
                    addToMap(waterByAge, age, qty);
                    addToMap(waterByHouseSum, houseId, qty);
                    addNested(waterByHouseAge, houseId, age, qty);
                    break;
            }
        }

        const weightByHouseAge = new Map<string, Map<number, WeightData>>();
        const weightByAge = new Map<number, WeightData>();
        const weightByWeek = new Map<number, WeightData>();

        weightRec.sort(
            (a, b) => a.farm_date.getTime() - b.farm_date.getTime()
        );
        for (const w of weightRec) {
            const wt = w.average_wt_grams.toNumber();
            const sampleSize = w.sample_size;

            const age = getBatchAgeInDays(batch.starting_date, w.farm_date as Date);
            const week = Math.ceil(age / 7);
            const houseId = w.house_id;

            // ---------- HOUSE + AGE ----------
            let houseMap = weightByHouseAge.get(houseId);

            if (!houseMap) {
                houseMap = new Map();
                weightByHouseAge.set(houseId, houseMap);
            }

            houseMap.set(age, {
                avgWeight: wt,
                sampleSize
            });

            // ---------- WEEK ----------
            weightByWeek.set(
                week,
                mergeWeight(weightByWeek.get(week), wt, sampleSize)
            );

            // ---------- AGE ----------
            weightByAge.set(
                age,
                mergeWeight(weightByAge.get(age), wt, sampleSize)
            );
        }
        const aliveByHouseAge = new Map<string, Map<number, number>>();
        const aliveByHouse = new Map<string, number>();
        const aliveByAge = new Map<number, number>();

        for (const [houseId, initial] of initialBirdsPerHouse.entries()) {
            let alive = initial;

            const houseMortality = mortalityByHouseAge.get(houseId);

            for (let age = 1; age <= batchAge; age++) {
                const mortalityToday = houseMortality?.get(age) ?? 0;

                if (mortalityToday > alive) {
                    throw new Error("Mortality exceeds alive birds");
                }

                alive -= mortalityToday;

                // store alive per house per age
                let houseAliveMap = aliveByHouseAge.get(houseId);

                if (!houseAliveMap) {
                    houseAliveMap = new Map();
                    aliveByHouseAge.set(houseId, houseAliveMap);
                }

                houseAliveMap.set(age, alive);

                // total alive across houses per age
                aliveByAge.set(age, (aliveByAge.get(age) ?? 0) + alive);
            }

            // final alive birds in this house
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
        data.mortalityPerHouse = [];

        for (const [houseId, ageMap] of mortalityByHouseAge) {
            for (const [age, mortality] of ageMap) {
                data.mortalityPerHouse.push({
                    houseId,
                    day: age,
                    mortality,
                });
            }
        }
        data.feedPerHouse = [];

        for (const [houseId, ageMap] of feedByHouseAge) {
            for (const [age, feed] of ageMap) {
                data.feedPerHouse.push({
                    houseId,
                    age,
                    feed,
                });
            }
        }
        data.waterPerHouse = [];

        for (const [houseId, ageMap] of waterByHouseAge) {
            for (const [age, water] of ageMap) {
                data.waterPerHouse.push({
                    houseId,
                    age,
                    water,
                });
            }
        }
        data.bodyWeightPerHouse = [];

        for (const [houseId, ageMap] of weightByHouseAge) {
            for (const [age, weight] of ageMap) {
                data.bodyWeightPerHouse.push({
                    houseId,
                    age,
                    sampleSize: weight.sampleSize,
                    avgWeight: weight.avgWeight,
                    week: Math.ceil(age / 7),
                });
            }
        }

        // data.aliveBirdsPerHouse =

        // Genaral Data
        const ages = new Set([
            ...feedByAge.keys(),
            ...waterByAge.keys(),
        ]);

        data.genaralFeedAndWater = [];

        for (const age of ages) {
            data.genaralFeedAndWater.push({
                age,
                feed: feedByAge.get(age) ?? 0,
                water: waterByAge.get(age) ?? 0,
            });
        }
        data.genaralFeed = [];

        for (const [age, feed] of feedByAge) {
            data.genaralFeed.push({ age, feed });
        }
        data.genaralBodyWeight = [];

        for (const [age, weight] of weightByAge) {
            data.genaralBodyWeight.push({
                age,
                week: Math.ceil(age / 7),
                sampleSize: weight.sampleSize,
                avgWeight: weight.avgWeight,
            });
        }
        data.genaralMortality = [];

        for (const [age, mortality] of mortalityByAge) {
            data.genaralMortality.push({
                day: age,
                mortality,
            });
        }

        data.genaralWater = [];

        for (const [age, water] of waterByAge) {
            data.genaralWater.push({ age, water });
        }

        data.genralAliveBirds = getGenaralAliveBirds(
            batch.initial_quantity,
            batchAge,
            mortalityByAge
        );

        let totalMortality = 0;
        for (const v of mortalityByAge.values()) {
            totalMortality += v;
        }
        data.totalMortalityGenaral = totalMortality;

        let totalFeed = 0;
        for (const v of feedByAge.values()) {
            totalFeed += v;
        }
        data.totalFeedGenaral = totalFeed;

        data.totalAliveBirdsGenaral =
            aliveByAge.get(batchAge) ?? 0

        data.mortalityRateGenaral =
            (data.totalMortalityGenaral / batch.initial_quantity) * 100;

        data.mortalityToday = mortalityByAge.get(batchAge) ?? 0;

        let latestAvgBodyWeight = 0;
        let latestAge = -1;

        for (const [age, weight] of weightByAge) {
            if (age > latestAge) {
                latestAge = age;
                latestAvgBodyWeight = weight.avgWeight;
            }
        }

        data.avgBodyWeightLatest = latestAvgBodyWeight;

        const currentBirdsBodyWeight =
            data.totalAliveBirdsGenaral * (data.avgBodyWeightLatest / 1000);

        const currentBirdsInitialBodyWeight =
            data.totalAliveBirdsGenaral * (batch.init_chicks_avg_wt / 1000);

        const netWeight =
            currentBirdsBodyWeight - currentBirdsInitialBodyWeight - weightLost;

        data.genaralFcr = netWeight > 0
            ? data.totalFeedGenaral / netWeight
            : 0;

        // const growthRate =
        //     (data.avgBodyWeightLatest - (weightByWeek.get(2)?.avgWeight ?? 0)) /
        //     7;



        // console.log(growthRate);

        // console.log(mortalityByWeek);
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
        // console.log(data)
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


function addToMap<K>(map: Map<K, number>, key: K, value: number) {
    map.set(key, (map.get(key) ?? 0) + value);
}

function addNested<K1, K2>(
    map: Map<K1, Map<K2, number>>,
    key1: K1,
    key2: K2,
    value: number
) {
    let inner = map.get(key1);

    if (!inner) {
        inner = new Map();
        map.set(key1, inner);
    }

    inner.set(key2, (inner.get(key2) ?? 0) + value);
}

function mergeWeight(
    prev: WeightData | undefined,
    avgWeight: number,
    sampleSize: number
): WeightData {
    if (!prev) {
        return { avgWeight, sampleSize };
    }

    const totalWeight =
        prev.avgWeight * prev.sampleSize +
        avgWeight * sampleSize;

    const totalSize = prev.sampleSize + sampleSize;

    return {
        avgWeight: totalWeight / totalSize,
        sampleSize: totalSize,
    };
}