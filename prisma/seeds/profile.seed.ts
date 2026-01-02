import { faker } from "@faker-js/faker";
import { UserRole } from "@/app/generated/prisma/enums";

type ProfileInput = {
    id: string;
    email: string | null;
    name: string;
    mobile: string;
    address: string | null;
    avatar_id: string | null;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
};

export function generateProfiles(count: number, role: UserRole) {
    if (count <= 0) return [];

    return Array.from({ length: count }).map(() => {
        const createdAt = faker.date.past({ years: 2 });

        return {
            id: faker.string.uuid(),

            email: faker.helpers.maybe(
                () => faker.internet.email().toLowerCase(),
                { probability: 0.7 }
            ),

            name: faker.person.fullName(),

            mobile: faker.phone.number({
                style: "national",
            }),

            address: faker.helpers.maybe(() => faker.location.streetAddress(), {
                probability: 0.6,
            }),

            // avatar_id: faker.helpers.maybe(() => faker.string.uuid(), {
            //     probability: 0.3,
            // }),

            role,

            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };
    });
}
