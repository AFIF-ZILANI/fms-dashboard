import { faker } from "@faker-js/faker";
import { ResourceCategories, Units } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";

const REAL_ITEMS = [
    // Feed
    {
        name: "Sonali Grower Feed",
        category: ResourceCategories.FEED,
        unit: Units.KG,
    },
    { name: "Layer Mash", category: ResourceCategories.FEED, unit: Units.KG },
    { name: "Husk", category: ResourceCategories.FEED, unit: Units.KG },

    // Medicine / Vaccines
    {
        name: "Ranikhet Vaccine",
        category: ResourceCategories.MEDICINE,
        unit: Units.BOTTLE,
    },
    {
        name: "Newcastle Vaccine",
        category: ResourceCategories.MEDICINE,
        unit: Units.BOTTLE,
    },
    {
        name: "Coccidiostat Liquid",
        category: ResourceCategories.MEDICINE,
        unit: Units.BOTTLE,
    },
    {
        name: "Antibiotic Mix",
        category: ResourceCategories.MEDICINE,
        unit: Units.BOTTLE,
    },

    // Supplements / Vitamins
    {
        name: "Vitamin D3",
        category: ResourceCategories.SUPPLEMENT,
        unit: Units.KG,
    },
    {
        name: "Probiotic Powder",
        category: ResourceCategories.SUPPLEMENT,
        unit: Units.KG,
    },
    {
        name: "Mineral Mix",
        category: ResourceCategories.SUPPLEMENT,
        unit: Units.KG,
    },

    // Lime / Others
    {
        name: "Agricultural Lime",
        category: ResourceCategories.BIOSECURITY,
        unit: Units.KG,
    },
    {
        name: "Calcium Powder",
        category: ResourceCategories.BIOSECURITY,
        unit: Units.KG,
    },
];

export type ItemInput = {
    id: string;
    name: string;
    category: ResourceCategories;
    unit: Units;
    meta_data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
};

export function generateRealisticStockItems(count: number): ItemInput[] {
    return Array.from({ length: count }).map(() => {
        const baseItem = faker.helpers.arrayElement(REAL_ITEMS);
        const createdAt = faker.date.past({ years: 1 });

        return {
            id: faker.string.uuid(),
            name: baseItem.name,
            category: baseItem.category,
            unit: baseItem.unit,
            meta_data: {
                company: faker.company.name(),
                batch_no: faker.string.alphanumeric(8).toUpperCase(),
                description: faker.lorem.sentence(),
                expiry_date: faker.date.future({ years: 2 }),
            },
            created_at: createdAt,
            updated_at: faker.date.between({ from: createdAt, to: new Date() }),
        };
    });
}

async function main() {
    console.log("Seeding item...");
    const items = generateRealisticStockItems(12);

    await prisma.item
        .createMany({
            data: items,
        })
        .then(() => console.log("Seeding Successfull"))
        .catch((e) => console.log("Seeding Faild", e));
}
main();
