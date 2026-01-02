import { BirdBreeds, InstrumentOwner } from "@/app/generated/prisma/enums";
import { Phase } from "@/config/bird-man.config";

export interface ProfileGraphProps {
    aliveBirdsArray: { age: number; alive: number }[];
    mortalityArray: { day: number; mortality: number }[];
    feedAndWaterConsumedArray: { age: number; feed: number; water: number }[];
    weightRecord: {
        week: number;
        avgWeight: number;
        sampleSize: number;
        age: number;
    }[];
}

export interface ProfileKPIsProps {
    totalAliveBirds: number;
    totalMortality: number;
    mortalityRate: number;
    totalFeedConsumed: number;
    mortalityToday: number;
    avgBodyWeightLatest?: number;
    fcr?: number;
    numberOfSeriousDeseasesHappen: number | null;
}

export interface ProfileBatchDetailsProps {
    batchId: string | null;
    phase: Phase | null;
    age: number;
    breed: BirdBreeds | null;
    initialQuantity: number;
    batchStart: Date | null;
    expectedSell: Date | null;
    supplier: string[];
    daysToSell: number;
    mortality24H?: number;
    mortality48H?: number;
    mortality72H?: number;
}

export interface BatchCardGroupProps {
    data: {
        activeBatches: {
            grower: number;
            brooder: number;
        };
        mortalityToday: {
            grower: number;
            brooder: number;
        };
        liveBirds: {
            grower: number;
            brooder: number;
        };
        totalMortality: {
            grower: number;
            brooder: number;
        };
        birdsAge: {
            grower: number;
            brooder: number;
        };
        feedConsumedToday: {
            grower: number;
            brooder: number;
        };
    };
}

export interface BatchOverviewGridProps {
    data: {
        batchId: {
            brooder: string;
            grower: string;
        };
        liveBirds: {
            brooder: number;
            grower: number;
        };
        feedConsumed: {
            brooder: number;
            grower: number;
        };
        mortalityToday: {
            brooder: number;
            grower: number;
        };
    };
}

export type IBatch = {
    startingDate: Date;
    initialQuantity: number;
    initChicksAvgWT: number;
    breed: BirdBreeds;
    suppliers: [
        {
            id: string;
            quantity: number;
            unit_price: number;
            qualityScore: number;
            deliveryDate: Date;
        },
    ];
};

export type HouseEventType = "FEED" | "WATER" | "MORTALITY";
export const EVENT_UNIT_MAP = {
    FEED: {
        canonical: "KG",
        uiUnits: ["KG", "BAG"],
    },
    WATER: {
        canonical: "LITER",
        uiUnits: ["LITER"],
    },
    MORTALITY: {
        canonical: "BIRD",
        uiUnits: ["BIRD"],
    },
} as const;

export type SupplierOption = {
    id: string;
    name: string;
    company?: string;
};

export type ActorSearchItem = {
    id: string;
    name: string;
    type: InstrumentOwner;
};
