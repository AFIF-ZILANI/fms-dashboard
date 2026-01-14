import { PaymentMethod, MfsType, UserRole } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";

type GenerateOptions = {
    ownerType: UserRole;
};

export async function generatePaymentInstrumentsMock(options: GenerateOptions) {
    const { ownerType } = options;

    // 1. Fetch profiles matching role
    const profiles = await prisma.profiles.findMany({
        where: {
            role: UserRole[ownerType],
        },
        select: {
            id: true,
        },
    });

    if (profiles.length === 0) {
        console.warn(`No profiles found for role ${ownerType}`);
        return;
    }

    const mfsTypes = [MfsType.BKASH, MfsType.NAGAD, MfsType.ROCKET];

    const instruments = profiles.flatMap((profile) => {
        const mfs = mfsTypes[Math.floor(Math.random() * mfsTypes.length)];

        return [
            {
                owner_type: ownerType,
                owner_id: profile.id,
                type: PaymentMethod.CASH,
                label: "Cash",
            },
            {
                owner_type: ownerType,
                owner_id: profile.id,
                type: PaymentMethod.BANK_TRANSFER,
                label: "Bank Account",
                bank_name: "Sonali Bank",
                account_no: `AC-${Math.floor(100000000 + Math.random() * 900000000)}`,
            },
            {
                owner_type: ownerType,
                owner_id: profile.id,
                type: PaymentMethod.MFS,
                label: `${mfs} Wallet`,
                mobile_no: `01${Math.floor(100000000 + Math.random() * 900000000)}`,
                mfs_type: mfs,
            },
        ];
    });

    // 2. Insert (skip duplicates is intentional)
    await prisma.paymentInstrument.createMany({
        data: instruments,
        skipDuplicates: true,
    });

    console.log(
        `Created ${instruments.length} payment instruments for ${ownerType}`
    );
}

console.log("Seeding payment instruemnts");
generatePaymentInstrumentsMock({ ownerType: UserRole.ADMIN })
    .then(() => {
        console.log("Seeding payment instruments completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error seeding payment instruments:", error);
        process.exit(1);
    });
