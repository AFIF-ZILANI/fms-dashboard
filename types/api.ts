import { BirdBreeds } from "@/app/generated/prisma/enums";
import { Phase } from "@/config/bird-man.config";
export type BatchSpecific = {
    mortalityToday: number;
    aliveBirds: number;
    phase: Phase | null;
    feedConsumedToday: number;
    waterConsumedToday: number;
    birdsAge: number | null;
    batchId: string | null;
    batch_bussiness_id: string | null;
};
export type BatchOverviewToday = {
    activeBatches: number | null;
    feedConsumed: number | null;
    waterConsumed: number | null;
    mortality: number | null;
    aliveBirds: number | null;
    waterFeedRatio: number | null;
    mortalityRate: number | null;
};
export type BatchOverviewData = {
    todaysData: BatchOverviewToday;
    batchSpecificData: BatchSpecific[];
};

export type BatchProfileData = {
    // --- basic data ---
    batchId: string | null;
    batch_bussiness_id: string;
    phase: Phase | null;
    age: number;
    breed: BirdBreeds | null;
    initialQuantity: number;
    batchStart: Date | null;
    expectedSell: Date | null;
    supplier: string[];
    daysToSell: number;
    mortality24H: number;
    mortality48H: number;
    mortality72H: number;
    mortalityToday: number;
    avgBodyWeightLatest: number;
    numberOfSeriousDeseasesHappen: number | null;

    // --- genaral Data ---

    totalMortalityGenaral: number;
    totalFeedGenaral: number;
    mortalityRateGenaral: number;
    totalAliveBirdsGenaral: number;

    genaralBodyWeight: {
        week: number;
        avgWeight: number;
        sampleSize: number;
        age: number;
    }[];
    genaralFcr: number;
    genralAliveBirds: {
        age: number;
        alive: number;
    }[];
    genaralMortality: {
        day: number;
        mortality: number;
    }[];
    genaralFeed: {
        age: number;
        feed: number;
    }[];
    genaralFeedAndWater: {
        age: number;
        feed: number;
        water: number;
    }[];
    genaralWater: {
        age: number;
        water: number;
    }[];

    // --- explicit data ---
    totalMortalityPerHouse: number;
    totalFeedPerHouse: number;
    mortalityRatePerHouse: number;
    totalAliveBirdsPerHouse: number;

    aliveBirdsPerHouse: {
        age: number;
        alive: number;
        houseId: number;
    }[];
    mortalityPerHouse: {
        day: number;
        houseId: string;
        mortality: number;
    }[];

    feedPerHouse: {
        age: number;
        feed: number;
        houseId: string;
    }[];
    waterPerHouse: {
        age: number;
        water: number;
        houseId: string;
    }[];

    bodyWeightPerHouse: {
        week: number;
        houseId: string;
        avgWeight: number; // grams
        sampleSize: number;
        age: number;
    }[];
    fcrPerHouse: {
        houseId: number;
        fcr: number;
    }[];
};
