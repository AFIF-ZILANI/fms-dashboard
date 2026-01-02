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

export function generateCustomer(): CustomerInput {
    const profile = generateProfiles(1, "CUSTOMER")[0];
    const createdAt = faker.date.recent({ days: 300 });

    return {
        profile,
        customer: {
            id: faker.string.uuid(),
            profile_id: profile.id,
            rating: faker.helpers.maybe(
                () => faker.number.float({ min: 2, max: 5 }),
                { probability: 0.6 }
            ) as number,
            company: faker.helpers.maybe(() => faker.company.name(), {
                probability: 0.4,
            }) as string,
            created_at: createdAt,
            updated_at: createdAt,
        },
    };
}

export function generateCustomers(count: number): CustomerInput[] {
    if (count <= 0) return [];

    return Array.from({ length: count }, () => generateCustomer());
}

async function main() {
    console.log("Seeding Customer...");
    const customers = generateCustomers(80);

    await prisma
        .$transaction(async (tx) => {
            await tx.profiles.createMany({
                data: customers.map((c) => c.profile),
            });

            await tx.customers.createMany({
                data: customers.map((c) => c.customer),
            });
        })
        .then(() => console.log("Seeding Successfull"))
        .catch(() => console.log("Seeding Faild"));
}

main();
