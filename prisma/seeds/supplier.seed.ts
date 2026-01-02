import {
    SupplierRoleNames,
    SupplierSupplyCategories,
} from "@/app/generated/prisma/enums";
import { generateProfiles } from "./profile.seed";
import { faker } from "@faker-js/faker";
import prisma from "@/lib/prisma";

type CustomerInput = {
    profile: ReturnType<typeof generateProfiles>[number];
    customer: {
        id: string;
        profile_id: string;
        rating: number | null;
        company: string | null;
        created_at: Date;
        updated_at: Date;
    };
};

type SupplierInput = {
    profile: ReturnType<typeof generateProfiles>[number];
    supplier: {
        id: string;
        profile_id: string;
        rating: number | null;
        role: SupplierRoleNames;
        type: SupplierSupplyCategories[];
        company: string | null;
        created_at: Date;
        updated_at: Date;
    };
};

export function generateSupplier(): SupplierInput {
    const profile = generateProfiles(1, "SUPPLIER")[0];
    const createdAt = faker.date.recent({ days: 300 });

    return {
        profile,
        supplier: {
            id: faker.string.uuid(),
            profile_id: profile.id,
            rating: faker.helpers.maybe(
                () => faker.number.float({ min: 2, max: 5 }),
                { probability: 0.6 }
            ) as number,
            role: faker.helpers.arrayElement(Object.values(SupplierRoleNames)),
            type: faker.helpers.arrayElements(
                Object.values(SupplierSupplyCategories),
                faker.number.int({ min: 1, max: 3 })
            ),
            company: faker.helpers.maybe(() => faker.company.name(), {
                probability: 0.6,
            }) as string,
            created_at: createdAt,
            updated_at: createdAt,
        },
    };
}

export function generateSuppliers(count: number): SupplierInput[] {
    if (count <= 0) return [];

    return Array.from({ length: count }, () => generateSupplier());
}

async function main() {
    console.log("Seeding supplier...");
    const suppliers = generateSuppliers(20);

    await prisma
        .$transaction(async (tx) => {
            await tx.profiles.createMany({
                data: suppliers.map((s) => s.profile),
            });

            await tx.suppliers.createMany({
                data: suppliers.map((s) => s.supplier),
            });
        })
        .then(() => console.log("Seeding Successfull"))
        .catch((e) => console.log("Seeding Faild", e));
}

main();